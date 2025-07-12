export interface Template {
  id: string;
  name: string;
  layout: string;
  itemStyle: string;
  maxPhotos: number;
}

export interface FrameTemplate {
  id: string;
  name: string;
  frameUrl: string;
  width: number;
  height: number;
  maxPhotos: number;
  photoPositions: Array<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>;
}

export interface UploadedFile {
  url: string;
  qrCode: string;
  expiresAt: string;
}

export type Resolution = "low" | "medium" | "high";
