import React from "react";
import Webcam from "react-webcam";
import { Camera, Timer, Layout } from "lucide-react";
import { Template, FrameTemplate } from "../types";

interface CameraSectionProps {
  webcamRef: React.RefObject<Webcam>;
  selectedTemplate: Template;
  selectedFrameTemplate: FrameTemplate | null;
  continuousMode: boolean;
  setContinuousMode: (mode: boolean) => void;
  continuousInterval: number;
  setContinuousInterval: (interval: number) => void;
  isMirrored: boolean;
  setIsMirrored: (mirrored: boolean) => void;
  getCameraAspectRatio: () => number;
  getCameraSize: () => { width: number; height: number };
  timer: number | null;
  isCapturing: boolean;
  photos: string[];
  startTimer: () => void;
  resetPhotos: () => void;
  isDarkMode: boolean;
}

const CameraSection: React.FC<CameraSectionProps> = ({
  webcamRef,
  selectedTemplate,
  selectedFrameTemplate,
  continuousMode,
  setContinuousMode,
  continuousInterval,
  setContinuousInterval,
  isMirrored,
  setIsMirrored,
  getCameraAspectRatio,
  getCameraSize,
  timer,
  isCapturing,
  photos,
  startTimer,
  resetPhotos,
  isDarkMode,
}) => {
  const maxPhotos = selectedFrameTemplate
    ? selectedFrameTemplate.maxPhotos
    : selectedTemplate.maxPhotos;

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
        isDarkMode
          ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
          : "bg-white/80 backdrop-blur-sm border-pink-200"
      }`}
    >
      <div className="mb-4 flex flex-wrap justify-center gap-2 sm:gap-4">
        <button
          onClick={() => setContinuousMode(!continuousMode)}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 text-sm sm:text-base ${
            continuousMode
              ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
              : isDarkMode
              ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
              : "bg-pink-100 text-pink-600 hover:bg-pink-200"
          }`}
        >
          <Camera size={16} className="sm:w-5 sm:h-5" />
          연속 촬영
        </button>
        {continuousMode && (
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 text-sm sm:text-base ${
              isDarkMode
                ? "bg-purple-500/20 text-purple-200"
                : "bg-pink-100 text-pink-600"
            }`}
          >
            <Timer size={14} className="sm:w-4 sm:h-4" />
            <select
              value={continuousInterval}
              onChange={(e) => setContinuousInterval(Number(e.target.value))}
              className={`bg-transparent border-none focus:ring-0 text-sm ${
                isDarkMode ? "text-purple-200" : "text-pink-600"
              }`}
            >
              <option value={2}>2초</option>
              <option value={3}>3초</option>
              <option value={5}>5초</option>
            </select>
          </div>
        )}
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 text-sm sm:text-base ${
            isMirrored
              ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
              : isDarkMode
              ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
              : "bg-pink-100 text-pink-600 hover:bg-pink-200"
          }`}
        >
          <Layout size={16} className="sm:w-5 sm:h-5" />
          좌우반전
        </button>
      </div>

      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          mirrored={isMirrored}
          className="w-full rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl"
          videoConstraints={{
            width: {
              ideal: getCameraSize().width,
            },
            height: {
              ideal: getCameraSize().height,
            },
            facingMode: "user",
            aspectRatio: getCameraAspectRatio(),
          }}
          style={{
            objectFit: "cover",
            imageRendering: "crisp-edges",
            aspectRatio: getCameraAspectRatio(),
          }}
        />

        {/* 타이머 뱃지 */}
        {(timer !== null || isCapturing) && (
          <div className="absolute top-4 right-4 z-10">
            {timer !== null ? (
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm ${
                  isDarkMode
                    ? "bg-purple-500/90 text-white border border-purple-400/50"
                    : "bg-pink-500/90 text-white border border-pink-400/50"
                }`}
              >
                {timer}초
              </div>
            ) : isCapturing ? (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm flex items-center gap-2 ${
                  isDarkMode
                    ? "bg-purple-500/90 text-white border border-purple-400/50"
                    : "bg-pink-500/90 text-white border border-pink-400/50"
                }`}
              >
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                촬영중
              </div>
            ) : null}
          </div>
        )}

        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          {photos.length > 0 && (
            <button
              onClick={resetPhotos}
              className={`px-4 sm:px-6 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm sm:text-base ${
                isDarkMode
                  ? "bg-purple-500 text-white hover:bg-purple-600 shadow-purple-500/20"
                  : "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/20"
              }`}
            >
              <Camera size={20} className="sm:w-6 sm:h-6" />
              <span>다시 촬영</span>
            </button>
          )}
          <button
            onClick={startTimer}
            disabled={photos.length >= maxPhotos || timer !== null}
            className={`px-4 sm:px-6 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm sm:text-base ${
              photos.length >= maxPhotos
                ? isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                : timer !== null
                ? "bg-pink-500 text-white shadow-pink-500/20"
                : isDarkMode
                ? "bg-purple-500 text-white hover:bg-purple-600 shadow-purple-500/20"
                : "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/20"
            }`}
          >
            <Camera size={20} className="sm:w-6 sm:h-6" />
            {timer !== null
              ? "촬영 준비중..."
              : `촬영 (${photos.length}/${maxPhotos})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraSection;
