import { Template, FrameTemplate } from "../types";
import frameBG from "../assets/frame/bg.jpg";
import frameBG2 from "../assets/frame/bg2.jpg";

export const backgrounds = [
  // 추상/패턴
  "url(https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop)",
  "url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop)",
  // 그라디언트
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  // 자연
  "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop)",
  "url(https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop)",
  // 벚꽃/꽃
  "url(https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=800&auto=format&fit=crop)",
  "url(https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=800&auto=format&fit=crop)",
  // 도시/야경
  "url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800&auto=format&fit=crop)",
  "url(https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop)",
];

export const templates: Template[] = [
  {
    id: "grid",
    name: "2x2 Grid",
    layout: "grid grid-cols-2 gap-4 p-3",
    itemStyle: "aspect-[3/4]",
    maxPhotos: 4,
    width: 360,
    height: 480,
    aspectRatio: 3 / 4,
  },
  {
    id: "vertical",
    name: "Vertical Strip",
    layout: "flex flex-col gap-2 p-3",
    itemStyle: "flex-1 rounded-lg",
    maxPhotos: 3,
    width: 480,
    height: 360,
    aspectRatio: 4 / 3,
    compact: true,
    displayWidth: 273,
    displayHeight: 600,
  },
  {
    id: "polaroid",
    name: "Polaroid Style",
    layout: "grid grid-cols-2 gap-6 p-6",
    itemStyle: "aspect-[3/4] rotate-3 shadow-xl",
    maxPhotos: 4,
    width: 360,
    height: 480,
    aspectRatio: 3 / 4,
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
