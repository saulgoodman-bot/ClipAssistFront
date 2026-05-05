import { useAuthStore } from '../store/authStore';
import {
  AuthResponse,
  MeResponse,
  UploadResponse,
  StatusResponse,
  TranscriptResponse,
  ClipResponse,
  ClipUpdateRequest,
  RenderResponse,
} from '../types/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ClipAssistClient {
  private get baseUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private get headers() {
    const token = useAuthStore.getState().token;
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!res.ok) {
      let message = 'API request failed';
      try {
        const errorData = await res.json();
        message = errorData.detail || errorData.message || message;
      } catch (e) {
        // use status text if no json body
        message = res.statusText || message;
      }
      throw new ApiError(res.status, message);
    }

    // handle empty response
    if (res.status === 204) {
      return null as any;
    }

    return res.json();
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async me(): Promise<MeResponse> {
    return this.request<MeResponse>('/users/me');
  }

  async uploadVideo(file: File, onProgress: (pct: number) => void): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseUrl}/videos/upload`);
      
      const token = useAuthStore.getState().token;
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          let message = 'Upload failed';
          try {
            const errorData = JSON.parse(xhr.responseText);
            message = errorData.detail || errorData.message || message;
          } catch (e) {
            message = xhr.statusText || message;
          }
          reject(new ApiError(xhr.status, message));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  }

  async ingestUrl(url: string): Promise<UploadResponse> {
    return this.request<UploadResponse>('/videos/ingest', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async getStatus(videoId: number): Promise<StatusResponse> {
    return this.request<StatusResponse>(`/videos/${videoId}/status`);
  }

  async getTranscript(videoId: number): Promise<TranscriptResponse> {
    return this.request<TranscriptResponse>(`/videos/${videoId}/transcript`);
  }

  async getClips(videoId: number): Promise<ClipResponse[]> {
    return this.request<ClipResponse[]>(`/videos/${videoId}/clips`);
  }

  async updateClip(clipId: number, data: ClipUpdateRequest): Promise<ClipResponse> {
    return this.request<ClipResponse>(`/clips/${clipId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async renderClip(clipId: number): Promise<RenderResponse> {
    return this.request<RenderResponse>(`/clips/${clipId}/render`, {
      method: 'POST',
    });
  }

  async downloadClip(clipId: number): Promise<string> {
    // assumes this returns JSON containing the presigned/direct URL: { url: "..." }
    const res = await this.request<{ url: string }>(`/clips/${clipId}/download`);
    return res.url;
  }

  async deleteVideo(videoId: number): Promise<void> {
    return this.request<void>(`/videos/${videoId}`, {
      method: 'DELETE',
    });
  }
}

export const ClipAssistAPI = new ClipAssistClient();
