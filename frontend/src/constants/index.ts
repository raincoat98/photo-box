import { Template, FrameTemplate } from "../types";
import frameBG from "../assets/frame/bg.jpg";
import frameBG2 from "../assets/frame/bg2.jpg";

export const backgrounds = [
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop",
];

export const templates: Template[] = [
  {
    id: "grid",
    name: "2x2 Grid",
    layout: "grid grid-cols-2 gap-4 p-3",
    itemStyle: "aspect-[3/4]",
    maxPhotos: 4,
  },
  {
    id: "vertical",
    name: "Vertical Strip",
    layout: "grid grid-cols-1 gap-4 p-3",
    itemStyle: "aspect-[3/2]",
    maxPhotos: 3,
  },
  {
    id: "polaroid",
    name: "Polaroid Style",
    layout: "grid grid-cols-2 gap-6 p-6",
    itemStyle: "aspect-[3/4] rotate-3 shadow-xl",
    maxPhotos: 4,
  },
];

export const frameTemplates: FrameTemplate[] = [
  {
    id: "frame-vertical-3cut-1",
    name: "프레임 3컷 세로",
    frameUrl: frameBG,
    width: 200,
    height: 600,
    maxPhotos: 3,
    photoPositions: [
      { top: 0.1, left: 0.1, width: 0.8, height: 0.22 },
      { top: 0.33, left: 0.1, width: 0.8, height: 0.22 },
      { top: 0.56, left: 0.1, width: 0.8, height: 0.22 },
    ],
  },
  {
    id: "frame-vertical-3cut-2",
    name: "프레임 3컷 세로2",
    frameUrl: frameBG2,
    width: 200,
    height: 600,
    maxPhotos: 3,
    photoPositions: [
      { top: 0.1, left: 0.1, width: 0.8, height: 0.22 },
      { top: 0.33, left: 0.1, width: 0.8, height: 0.22 },
      { top: 0.56, left: 0.1, width: 0.8, height: 0.22 },
    ],
  },
];
