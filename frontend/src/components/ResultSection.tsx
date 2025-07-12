import React, { useEffect, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { Template, FrameTemplate, Resolution } from "../types";

interface ResultSectionProps {
  resultRef: React.RefObject<HTMLDivElement>;
  selectedTemplate: Template;
  selectedFrameTemplate: FrameTemplate | null;
  selectedBackground: string;
  photos: string[];
  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;
  downloadResult: () => void;
  generateQRCode: () => void;
  isDownloading: boolean;
  isUploading: boolean;
  isDarkMode: boolean;
}

const ResultSection: React.FC<ResultSectionProps> = ({
  resultRef,
  selectedTemplate,
  selectedFrameTemplate,
  selectedBackground,
  photos,
  resolution,
  setResolution,
  downloadResult,
  generateQRCode,
  isDownloading,
  isUploading,
  isDarkMode,
}) => {
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const frameUrl = selectedFrameTemplate
      ? selectedFrameTemplate.frameUrl
      : null;
    if (!frameUrl) return;
    const img = new window.Image();
    img.src = frameUrl;
    img.onload = () => {
      setFrameSize({ width: img.width, height: img.height });
    };
  }, [selectedFrameTemplate]);

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
      {selectedFrameTemplate ? (
        <div className="overflow-auto max-h-[800px]">
          <div
            ref={resultRef}
            style={{
              width: selectedFrameTemplate.width || frameSize.width || 320,
              height: selectedFrameTemplate.height || frameSize.height || 800,
              position: "relative",
              background: "#fff",
              margin: "0 auto",
              transform: "scale(1)",
              transformOrigin: "top center",
            }}
          >
            {/* 배경 이미지 (맨 뒤) */}
            <img
              src={selectedBackground}
              alt="Background"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
                opacity: 0.4,
              }}
            />
            {/* 사진들 (중간) */}
            {selectedFrameTemplate.photoPositions?.map((pos, idx) => (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  top: `${pos.top * 100}%`,
                  left: `${pos.left * 100}%`,
                  width: `${pos.width * 100}%`,
                  height: `${pos.height * 100}%`,
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#eee",
                  zIndex: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {photos[idx] ? (
                  <img
                    src={photos[idx]}
                    alt={`Photo ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "#bbb", fontSize: 18 }}>
                    사진 {idx + 1}
                  </span>
                )}
              </div>
            ))}
            {/* 프레임 오버레이 (맨 위) */}
            <img
              src={selectedFrameTemplate.frameUrl}
              alt="frame"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          </div>
        </div>
      ) : (
        <div
          ref={resultRef}
          className="relative bg-white rounded-xl overflow-hidden shadow-lg"
          style={{ minHeight: "400px" }}
        >
          <img
            src={selectedBackground}
            alt="Background"
            className="w-full h-full absolute top-0 left-0 object-cover opacity-50"
          />
          <div className={`relative z-10 ${selectedTemplate.layout}`}>
            {[...Array(selectedTemplate.maxPhotos)].map((_, index) => (
              <div
                key={index}
                className={`${selectedTemplate.itemStyle} bg-gray-200 rounded-xl overflow-hidden`}
              >
                {photos[index] ? (
                  <img
                    src={photos[index]}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      imageRendering: "crisp-edges",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    사진 {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setResolution("low")}
            className={`flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
              resolution === "low"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                : isDarkMode
                ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                : "bg-pink-100 text-pink-600 hover:bg-pink-200"
            }`}
          >
            저해상도
          </button>
          <button
            onClick={() => setResolution("medium")}
            className={`flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
              resolution === "medium"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                : isDarkMode
                ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                : "bg-pink-100 text-pink-600 hover:bg-pink-200"
            }`}
          >
            중해상도
          </button>
          <button
            onClick={() => setResolution("high")}
            className={`flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
              resolution === "high"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                : isDarkMode
                ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                : "bg-pink-100 text-pink-600 hover:bg-pink-200"
            }`}
          >
            고해상도
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={downloadResult}
            disabled={photos.length !== maxPhotos || isDownloading}
            className={`flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              photos.length !== maxPhotos || isDownloading
                ? isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isDarkMode
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-pink-100 text-pink-600 hover:bg-pink-200"
            }`}
          >
            <Download size={20} />
            <span>{isDownloading ? "다운로드 중..." : "결과 다운로드"}</span>
          </button>
          <button
            onClick={generateQRCode}
            disabled={photos.length !== maxPhotos || isUploading}
            className={`flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              photos.length !== maxPhotos || isUploading
                ? isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isDarkMode
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-pink-100 text-pink-600 hover:bg-pink-200"
            }`}
          >
            <QrCode size={20} />
            <span>{isUploading ? "업로드 중..." : "QR 코드"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
