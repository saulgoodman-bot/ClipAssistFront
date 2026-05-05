export interface AuthResponse {
  user_id: number;
  email: string;
  plan: string;
  access_token: string;
}

export interface MeResponse {
  user_id: number;
  email: string;
  plan: string;
}

export type VideoStatus = "pending" | "processing" | "completed" | "failed" | "deleted";

export interface UploadResponse {
  video_id: number;
  status: VideoStatus;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

export interface TranscriptResponse {
  video_id: number;
  language: string;
  full_text: string;
  segments: readonly TranscriptSegment[];
}

export type ClipStatus = "pending" | "rendering" | "edited" | "ready" | "completed";

export interface ClipResponse {
  id: number;
  start_time: number;
  end_time: number;
  title: string;
  score: number;
  reason: string;
  s3_path: string;
  status: ClipStatus;
  layout_mode: string;
}

export interface ClipUpdateRequest {
  start_time?: number;
  end_time?: number;
  title?: string;
  layout_mode?: string;
}

export interface RenderResponse {
  clip_id: number;
  status: string;
}

export interface StatusResponse {
  video_id: number;
  status: VideoStatus;
  progress_stage: string;
  clips: readonly ClipResponse[];
  error_message?: string;
  duration?: number;
}
