import { useEffect, useRef, useState } from 'react';
import { Download, QrCode } from 'lucide-react';
import { Template, FrameTemplate, Resolution } from '../types';

interface Props {
  resultRef: React.RefObject<HTMLDivElement>;
  template: Template;
  frameTemplate: FrameTemplate | null;
  background: string;
  photos: string[];
  maxPhotos: number;
  resolution: Resolution;
  setResolution: (r: Resolution) => void;
  isDownloading: boolean;
  isUploading: boolean;
  onDownload: () => void;
  onQR: () => void;
}

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: 'low', label: '저해상도' },
  { value: 'medium', label: '중해상도' },
  { value: 'high', label: '고해상도' },
];

export default function Result({
  resultRef,
  template,
  frameTemplate,
  background,
  photos,
  maxPhotos,
  resolution,
  setResolution,
  isDownloading,
  isUploading,
  onDownload,
  onQR,
}: Props) {
  const canExport = photos.length === maxPhotos;
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const fixedW = frameTemplate?.width ?? (template.displayWidth ?? template.width);
  const fixedH = frameTemplate?.height ?? (template.displayHeight ?? template.height);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el || !fixedW || !fixedH) return;
    const update = () => {
      const s = Math.min(el.clientWidth / fixedW, el.clientHeight / fixedH, 1);
      setPreviewScale(s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedW, fixedH]);

  return (
    <div className="card flex flex-col gap-2 lg:min-h-0">
      {/* Preview */}
      <div
        ref={previewContainerRef}
        className="md:flex-1 md:min-h-0 overflow-hidden flex items-start justify-center"
      >
        {frameTemplate ? (
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', flexShrink: 0 }}>
            <div
              ref={resultRef}
              className="relative bg-white"
              style={{ width: frameTemplate.width, height: frameTemplate.height }}
            >
              <div className="absolute inset-0 w-full h-full opacity-40" style={{ background, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              {frameTemplate.photoPositions.map((pos, i) => (
                <div
                  key={i}
                  className="absolute overflow-hidden rounded-2xl bg-zinc-200 flex items-center justify-center"
                  style={{
                    top: `${pos.top * 100}%`,
                    left: `${pos.left * 100}%`,
                    width: `${pos.width * 100}%`,
                    height: `${pos.height * 100}%`,
                    zIndex: 11,
                  }}
                >
                  {photos[i]
                    ? <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                    : <span className="text-zinc-400 text-sm">사진 {i + 1}</span>}
                </div>
              ))}
              <img
                src={frameTemplate.frameUrl}
                alt=""
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10 }}
              />
            </div>
          </div>
        ) : template.compact ? (
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', flexShrink: 0 }}>
            <div
              ref={resultRef}
              className="relative bg-white"
              style={{ width: template.displayWidth ?? template.width, height: template.displayHeight ?? template.height }}
            >
              <div className="absolute inset-0 w-full h-full opacity-40" style={{ background, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className={`absolute inset-0 z-10 ${template.layout}`}>
                {Array.from({ length: template.maxPhotos }, (_, i) => (
                  <div key={i} className={`${template.itemStyle} overflow-hidden bg-zinc-200 flex items-center justify-center`}>
                    {photos[i]
                      ? <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                      : <span className="text-zinc-400 text-sm">사진 {i + 1}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', flexShrink: 0 }}>
            <div
              ref={resultRef}
              className="relative rounded-xl overflow-hidden bg-zinc-200"
              style={{ width: template.displayWidth ?? template.width, height: template.displayHeight ?? template.height }}
            >
              <div className="absolute inset-0 w-full h-full opacity-50" style={{ background, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className={`relative z-10 ${template.layout}`}>
                {Array.from({ length: template.maxPhotos }, (_, i) => (
                  <div key={i} className={`${template.itemStyle} bg-zinc-200 rounded-xl overflow-hidden flex items-center justify-center`}>
                    {photos[i]
                      ? <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                      : <span className="text-zinc-400 text-sm">사진 {i + 1}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resolution */}
      <div className="flex gap-2">
        {RESOLUTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setResolution(value)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              resolution === value
                ? 'bg-pink-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onDownload} disabled={!canExport || isDownloading} className="btn-primary flex-1">
          <Download size={16} />
          {isDownloading ? '다운로드 중...' : '다운로드'}
        </button>
        <button onClick={onQR} disabled={!canExport || isUploading} className="btn-primary flex-1">
          <QrCode size={16} />
          {isUploading ? '업로드 중...' : 'QR 코드'}
        </button>
      </div>
    </div>
  );
}
