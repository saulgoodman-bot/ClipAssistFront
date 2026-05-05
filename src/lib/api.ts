import { useAuthStore } from '../store/authStore';
import {
  AuthResponse,
  ClipResponse,
  ClipUpdateRequest,
  MeResponse,
  RenderResponse,
  StatusResponse,
  TranscriptResponse,
  UploadResponse,
} from '../types/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private get headers() {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(res.status, errorData.detail || res.statusText);
    }
    return res.json();
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Note: FastAPI OAuth2 uses form data usually, but request asked for just standard
    // Or if json, we send json. Assuming standard JSON.
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async me(): Promise<MeResponse> {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: this.headers,
    });
    return this.handleResponse<MeResponse>(res);
  }

  uploadVideo(file: File, onProgress: (pct: number) => void): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/videos/upload`);
      const token = useAuthStore.getState().token;
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new ApiError(xhr.status, 'Invalid JSON response'));
          }
        } else {
          let msg = xhr.statusText;
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData.detail) msg = errData.detail;
          } catch (e) {}
          reject(new ApiError(xhr.status, msg));
        }
      };

      xhr.onerror = () => reject(new ApiError(0, 'Network Error'));

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  }

  async ingestUrl(url: string): Promise<UploadResponse> {
    const res = await fetch(`${API_URL}/videos/ingest`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ url }),
    });
    return this.handleResponse<UploadResponse>(res);
  }

  async getStatus(videoId: number): Promise<StatusResponse> {
    const res = await fetch(`${API_URL}/videos/${videoId}/status`, {
      headers: this.headers,
    });
    return this.handleResponse<StatusResponse>(res);
  }

  async getTranscript(videoId: number): Promise<TranscriptResponse> {
    const res = await fetch(`${API_URL}/videos/${videoId}/transcript`, {
      headers: this.headers,
    });
    return this.handleResponse<TranscriptResponse>(res);
  }

  async getClips(videoId: number): Promise<ClipResponse[]> {
    const res = await fetch(`${API_URL}/videos/${videoId}/clips`, {
      headers: this.headers,
    });
    return this.handleResponse<ClipResponse[]>(res);
  }

  async updateClip(clipId: number, data: ClipUpdateRequest): Promise<ClipResponse> {
    const res = await fetch(`${API_URL}/clips/${clipId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<ClipResponse>(res);
  }

  async renderClip(clipId: number): Promise<RenderResponse> {
    const res = await fetch(`${API_URL}/clips/${clipId}/render`, {
      method: 'POST',
      headers: this.headers,
    });
    return this.handleResponse<RenderResponse>(res);
  }

  async downloadClip(clipId: number): Promise<string> {
    const res = await fetch(`${API_URL}/clips/${clipId}/download`, {
      headers: this.headers,
    });
    const data = await this.handleResponse<{ download_url: string }>(res);
    return data.download_url;
  }

  async deleteVideo(videoId: number): Promise<void> {
    const res = await fetch(`${API_URL}/videos/${videoId}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    await this.handleResponse<void>(res);
  }
}

export const ClipAssistAPI = new ApiClient();
