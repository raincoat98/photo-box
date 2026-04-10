import Webcam from 'react-webcam';
import { Camera as CameraIcon, FlipHorizontal, Timer } from 'lucide-react';

interface Props {
  webcamRef: React.RefObject<Webcam>;
  isMirrored: boolean;
  setIsMirrored: (v: boolean) => void;
  continuousMode: boolean;
  setContinuousMode: (v: boolean) => void;
  continuousInterval: number;
  setContinuousInterval: (v: number) => void;
  timer: number | null;
  isCapturing: boolean;
  photos: string[];
  maxPhotos: number;
  aspectRatio: number;
  cameraSize: { width: number; height: number };
  onShoot: () => void;
  onReset: () => void;
}

export default function Camera({
  webcamRef,
  isMirrored,
  setIsMirrored,
  continuousMode,
  setContinuousMode,
  continuousInterval,
  setContinuousInterval,
  timer,
  isCapturing,
  photos,
  maxPhotos,
  aspectRatio,
  cameraSize,
  onShoot,
  onReset,
}: Props) {
  return (
    <div className="card flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setContinuousMode(!continuousMode)}
          className={`btn-toggle ${continuousMode ? 'active' : ''}`}
        >
          <CameraIcon size={14} />
          연속 촬영
        </button>

        {continuousMode && (
          <span className="btn-secondary cursor-default">
            <Timer size={14} />
            <select
              value={continuousInterval}
              onChange={(e) => setContinuousInterval(Number(e.target.value))}
              className="bg-transparent border-0 focus:ring-0 text-sm cursor-pointer outline-none"
            >
              {[2, 3, 5].map((s) => (
                <option key={s} value={s}>{s}초</option>
              ))}
            </select>
          </span>
        )}

        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className={`btn-toggle ${isMirrored ? 'active' : ''}`}
        >
          <FlipHorizontal size={14} />
          좌우반전
        </button>
      </div>

      {/* Webcam */}
      <div className="relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/png"
          mirrored={isMirrored}
          className="w-full block"
          videoConstraints={{
            width: { ideal: cameraSize.width },
            height: { ideal: cameraSize.height },
            facingMode: 'user',
            aspectRatio,
          }}
          style={{ aspectRatio: String(aspectRatio), objectFit: 'cover' }}
        />

        {(timer !== null || isCapturing) && (
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1 rounded-full bg-pink-500 text-white text-sm font-semibold shadow">
              {timer !== null ? (
                `${timer}초`
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
                  촬영중
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {photos.length > 0 && (
          <button onClick={onReset} className="btn-secondary flex-1">
            다시 촬영
          </button>
        )}
        <button
          onClick={onShoot}
          disabled={photos.length >= maxPhotos || timer !== null}
          className="btn-primary flex-1"
        >
          <CameraIcon size={16} />
          {timer !== null ? '준비중...' : `촬영 (${photos.length}/${maxPhotos})`}
        </button>
      </div>
    </div>
  );
}
