export type VideoStatus = "pending" | "processing" | "completed" | "failed" | "deleted";
export type ClipStatus = "pending" | "rendering" | "edited" | "ready" | "completed";

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

export interface UploadResponse {
  video_id: number;
  status: VideoStatus;
}

export interface TranscriptSegment {
  readonly start: number;
  readonly end: number;
  readonly speaker: string;
  readonly text: string;
}

export interface TranscriptResponse {
  readonly video_id: number;
  readonly language: string;
  readonly full_text: string;
  readonly segments: readonly TranscriptSegment[];
}

export interface ClipResponse {
  readonly id: number;
  readonly start_time: number;
  readonly end_time: number;
  readonly title: string;
  readonly score: number;
  readonly reason: string;
  readonly s3_path: string;
  readonly status: ClipStatus;
  readonly layout_mode?: string;
}

export interface ClipUpdateRequest {
  start_time?: number;
  end_time?: number;
  title?: string;
  layout_mode?: string;
}

export interface RenderResponse {
  clip_id: number;
  status: ClipStatus;
}

export interface StatusResponse {
  video_id: number;
  status: VideoStatus;
  progress_stage?: string;
  clips?: readonly ClipResponse[];
  error_message?: string;
  duration?: number;
}
