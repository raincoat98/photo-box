import React, { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Download,
  Layout,
  Timer,
  Sun,
  Moon,
  QrCode,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import imageCompression from "browser-image-compression";
import { QRCodeSVG } from "qrcode.react";
import frameBG from "./assets/frame/bg.jpg";

const backgrounds = [
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop",
];

const templates = [
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
  {
    id: "frame-vertical-3cut",
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
];

function App() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [timer, setTimer] = useState<number | null>(null);
  const [continuousMode, setContinuousMode] = useState(false);
  const [continuousInterval, setContinuousInterval] = useState(3);
  const [resolution, setResolution] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  const getPhotoAspectRatio = useCallback(() => {
    if (
      selectedTemplate.photoPositions &&
      selectedTemplate.photoPositions.length > 0
    ) {
      const pos = selectedTemplate.photoPositions[0];
      const photoWidth = pos.width * (selectedTemplate.width || 200);
      const photoHeight = pos.height * (selectedTemplate.height || 600);
      return photoWidth / photoHeight;
    } else if (selectedTemplate.itemStyle) {
      const match = selectedTemplate.itemStyle.match(/aspect-\[(\d+)\/(\d+)\]/);
      if (match) {
        return Number(match[1]) / Number(match[2]);
      }
    }
    return 1 / 3;
  }, [
    selectedTemplate.photoPositions,
    selectedTemplate.itemStyle,
    selectedTemplate.width,
    selectedTemplate.height,
  ]);

  const capture = useCallback(async () => {
    if (webcamRef.current && photos.length < selectedTemplate.maxPhotos) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          // Base64 이미지를 Blob으로 변환
          const response = await fetch(imageSrc);
          const blob = await response.blob();
          const file = new File([blob], "photo.png", { type: "image/png" });

          // 이미지 압축 옵션
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/png",
          };

          // 이미지 압축
          const compressedFile = await imageCompression(file, options);

          // 압축된 이미지를 Base64로 변환
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            setPhotos((prev) => {
              // 최대 사진 개수를 초과하지 않도록 체크
              if (prev.length >= selectedTemplate.maxPhotos) {
                return prev;
              }
              return [...prev, base64data];
            });
          };
        } catch (error) {
          console.error("Error processing image:", error);
          setPhotos((prev) => {
            // 최대 사진 개수를 초과하지 않도록 체크
            if (prev.length >= selectedTemplate.maxPhotos) {
              return prev;
            }
            return [...prev, imageSrc];
          });
        }
      }
    }
  }, [photos, selectedTemplate.maxPhotos]);

  const startTimer = useCallback(() => {
    if (photos.length >= selectedTemplate.maxPhotos) return;
    if (continuousMode) {
      setTimer(continuousInterval);
    } else {
      capture();
    }
  }, [
    photos.length,
    selectedTemplate.maxPhotos,
    continuousMode,
    continuousInterval,
    capture,
  ]);

  useEffect(() => {
    if (timer === null) return;

    if (timer === 0) {
      capture();
      setTimer(null);

      // 연속 촬영 모드일 경우 다음 촬영 준비
      if (continuousMode && photos.length < selectedTemplate.maxPhotos - 1) {
        setTimeout(() => {
          setTimer(continuousInterval);
        }, 1000);
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    timer,
    capture,
    continuousMode,
    photos.length,
    selectedTemplate.maxPhotos,
    continuousInterval,
  ]);

  const resetPhotos = () => {
    setPhotos([]);
    setTimer(null);
  };

  const downloadResult = useCallback(() => {
    if (resultRef.current === null || isDownloading) {
      return;
    }

    setIsDownloading(true);

    const resolutionMultiplier = {
      low: 3,
      medium: 5,
      high: 10,
    }[resolution];

    htmlToImage
      .toPng(resultRef.current, {
        quality: 1.0,
        pixelRatio: resolutionMultiplier,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        width: selectedTemplate.width
          ? selectedTemplate.width * resolutionMultiplier
          : undefined,
        height: selectedTemplate.height
          ? selectedTemplate.height * resolutionMultiplier
          : undefined,
      })
      .then(async (dataUrl) => {
        try {
          // Base64 이미지를 Blob으로 변환
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], "life4cut.png", { type: "image/png" });

          // 이미지 압축 옵션
          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 3840,
            useWebWorker: true,
            fileType: "image/png",
          };

          // 이미지 압축
          const compressedFile = await imageCompression(file, options);

          // 압축된 이미지를 다운로드
          const url = URL.createObjectURL(compressedFile);
          setDownloadUrl(url);
          setShowQR(true);

          const link = document.createElement("a");
          link.download = "life4cut.png";
          link.href = url;
          link.click();
        } catch (error) {
          console.error("Error processing final image:", error);
          // 압축 실패시 원본 이미지 다운로드
          setDownloadUrl(dataUrl);
          setShowQR(true);
          const link = document.createElement("a");
          link.download = "life4cut.png";
          link.href = dataUrl;
          link.click();
        }
      })
      .catch((err) => {
        console.error("Error downloading image:", err);
      })
      .finally(() => {
        // 1초 후에 다운로드 상태 해제
        setTimeout(() => {
          setIsDownloading(false);
        }, 1000);
      });
  }, [
    resolution,
    selectedTemplate.width,
    selectedTemplate.height,
    isDownloading,
  ]);

  const generateQRCode = useCallback(() => {
    if (resultRef.current === null || isDownloading) {
      return;
    }

    setIsDownloading(true);

    const resolutionMultiplier = {
      low: 3,
      medium: 5,
      high: 10,
    }[resolution];

    htmlToImage
      .toPng(resultRef.current, {
        quality: 1.0,
        pixelRatio: resolutionMultiplier,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        width: selectedTemplate.width
          ? selectedTemplate.width * resolutionMultiplier
          : undefined,
        height: selectedTemplate.height
          ? selectedTemplate.height * resolutionMultiplier
          : undefined,
      })
      .then(async (dataUrl) => {
        try {
          // Base64 이미지를 Blob으로 변환
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], "life4cut.png", { type: "image/png" });

          // 이미지 압축 옵션
          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 3840,
            useWebWorker: true,
            fileType: "image/png",
          };

          // 이미지 압축
          const compressedFile = await imageCompression(file, options);

          // 압축된 이미지 URL 생성
          const url = URL.createObjectURL(compressedFile);
          setDownloadUrl(url);
          setShowQR(true);
        } catch (error) {
          console.error("Error processing image:", error);
          setDownloadUrl(dataUrl);
          setShowQR(true);
        }
      })
      .catch((err) => {
        console.error("Error generating QR code:", err);
      })
      .finally(() => {
        setTimeout(() => {
          setIsDownloading(false);
        }, 1000);
      });
  }, [
    resolution,
    selectedTemplate.width,
    selectedTemplate.height,
    isDownloading,
  ]);

  useEffect(() => {
    if (!selectedTemplate.frameUrl) return;
    const img = new window.Image();
    img.src = selectedTemplate.frameUrl;
    img.onload = () => {
      setFrameSize({ width: img.width, height: img.height });
    };
  }, [selectedTemplate.frameUrl]);

  return (
    <div
      className={`min-h-screen p-8 transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
          : "bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-row gap-8">
        {/* 왼쪽: 메인(카메라/결과) */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex justify-between items-center mb-8">
            <div className="relative group">
              <h1
                className={`text-4xl font-bold text-center transition-all duration-500 animate-fade-in relative z-10 flex flex-col items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                  포토 부스
                </span>
                <span className="text-sm text-gray-500">
                  당신의 소중한 순간을 담아보세요
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all duration-500 hover:scale-110 ${
                isDarkMode
                  ? "bg-purple-500/20 text-yellow-400 hover:bg-purple-500/30"
                  : "bg-pink-500/20 text-pink-600 hover:bg-pink-500/30"
              }`}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div
              className={`p-6 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
                isDarkMode
                  ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
                  : "bg-white/80 backdrop-blur-sm border-pink-200"
              }`}
            >
              <div className="mb-4 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setContinuousMode(!continuousMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                    continuousMode
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                      : isDarkMode
                      ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                      : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                  }`}
                >
                  <Camera size={18} />
                  연속 촬영
                </button>
                {continuousMode && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      isDarkMode
                        ? "bg-purple-500/20 text-purple-200"
                        : "bg-pink-100 text-pink-600"
                    }`}
                  >
                    <Timer size={16} />
                    <select
                      value={continuousInterval}
                      onChange={(e) =>
                        setContinuousInterval(Number(e.target.value))
                      }
                      className={`bg-transparent border-none focus:ring-0 text-sm ${
                        isDarkMode ? "text-purple-200" : "text-pink-600"
                      }`}
                    >
                      <option value={2}>2초 간격</option>
                      <option value={3}>3초 간격</option>
                      <option value={5}>5초 간격</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  className="w-full rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl"
                  videoConstraints={{
                    width: {
                      ideal:
                        selectedTemplate.id === "vertical-strip" ? 200 : 300,
                    },
                    height: {
                      ideal:
                        selectedTemplate.id === "vertical-strip" ? 600 : 400,
                    },
                    facingMode: "user",
                    aspectRatio: getPhotoAspectRatio(),
                  }}
                  style={{
                    objectFit: "cover",
                    imageRendering: "crisp-edges",
                    aspectRatio: getPhotoAspectRatio(),
                    maxWidth:
                      selectedTemplate.id === "vertical-strip"
                        ? "200px"
                        : "300px",
                    maxHeight:
                      selectedTemplate.id === "vertical-strip"
                        ? "600px"
                        : "400px",
                    margin: "0 auto",
                  }}
                />
                {timer !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl animate-pulse">
                    <span className="text-white text-7xl font-bold animate-bounce">
                      {timer}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                  {photos.length > 0 && (
                    <button
                      onClick={resetPhotos}
                      className={`px-6 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                        isDarkMode
                          ? "bg-purple-500 text-white hover:bg-purple-600 shadow-purple-500/20"
                          : "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/20"
                      }`}
                    >
                      <Camera size={24} />
                      <span>다시 촬영</span>
                    </button>
                  )}
                  <button
                    onClick={startTimer}
                    disabled={
                      photos.length >= selectedTemplate.maxPhotos ||
                      timer !== null
                    }
                    className={`px-6 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                      photos.length >= selectedTemplate.maxPhotos
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
                    <Camera size={24} />
                    {timer !== null
                      ? "촬영 준비중..."
                      : `촬영 (${photos.length}/${selectedTemplate.maxPhotos})`}
                  </button>
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div
              className={`p-6 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
                isDarkMode
                  ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
                  : "bg-white/80 backdrop-blur-sm border-pink-200"
              }`}
            >
              {selectedTemplate.id === "frame-vertical-3cut" ? (
                <div className="overflow-auto max-h-[800px]">
                  <div
                    ref={resultRef}
                    style={{
                      width: selectedTemplate.width || frameSize.width || 320,
                      height:
                        selectedTemplate.height || frameSize.height || 800,
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
                        opacity: 0.2,
                      }}
                    />
                    {/* 사진들 (중간) */}
                    {selectedTemplate.photoPositions?.map((pos, idx) => (
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
                      src={selectedTemplate.frameUrl}
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
                    className="w-full h-full absolute top-0 left-0 object-cover opacity-20"
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
                <div className="flex gap-2">
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
                <div className="flex gap-2">
                  <button
                    onClick={downloadResult}
                    disabled={
                      photos.length !== selectedTemplate.maxPhotos ||
                      isDownloading
                    }
                    className={`flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                      photos.length !== selectedTemplate.maxPhotos ||
                      isDownloading
                        ? isDarkMode
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                    }`}
                  >
                    <Download size={20} />
                    <span>
                      {isDownloading ? "다운로드 중..." : "결과 다운로드"}
                    </span>
                  </button>
                  <button
                    onClick={generateQRCode}
                    disabled={
                      photos.length !== selectedTemplate.maxPhotos ||
                      isDownloading
                    }
                    className={`flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                      photos.length !== selectedTemplate.maxPhotos ||
                      isDownloading
                        ? isDarkMode
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                    }`}
                  >
                    <QrCode size={20} />
                    <span>{isDownloading ? "생성 중..." : "QR 코드"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 오른쪽: 사이드바(템플릿/배경 선택) */}
        <div className="w-64 flex flex-col gap-6 sticky top-8 self-start">
          {/* Template Selection */}
          <div
            className={`p-4 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
              isDarkMode
                ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
                : "bg-white/80 backdrop-blur-sm border-pink-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <Layout size={20} /> 템플릿
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setPhotos([]);
                  }}
                  className={`p-2 rounded-xl border text-xs transition-all duration-300 hover:scale-105 ${
                    selectedTemplate.id === template.id
                      ? isDarkMode
                        ? "border-purple-400 bg-purple-400/20 text-white shadow-lg shadow-purple-400/20"
                        : "border-pink-500 bg-pink-500/10 text-pink-500 shadow-lg shadow-pink-500/20"
                      : isDarkMode
                      ? "border-purple-500/30 text-purple-200 hover:border-purple-400 hover:bg-purple-400/10"
                      : "border-pink-200 text-pink-600 hover:border-pink-500 hover:bg-pink-50"
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
          {/* Background Selection */}
          {!selectedTemplate.frameUrl && (
            <div
              className={`p-4 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
                isDarkMode
                  ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
                  : "bg-white/80 backdrop-blur-sm border-pink-200"
              }`}
            >
              <h2
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                배경
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {backgrounds.map((bg, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedBackground(bg)}
                    className={`rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 w-full aspect-video ${
                      selectedBackground === bg
                        ? "border-pink-500 shadow-lg shadow-pink-500/20"
                        : isDarkMode
                        ? "border-purple-500/30 hover:border-purple-400"
                        : "border-pink-200 hover:border-pink-500"
                    }`}
                  >
                    <img
                      src={bg}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR 코드 모달 */}
      {showQR && downloadUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-2xl shadow-xl border ${
              isDarkMode
                ? "bg-purple-900/90 backdrop-blur-sm border-purple-500/30"
                : "bg-white/90 backdrop-blur-sm border-pink-200"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                QR 코드로 다운로드
              </h3>
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG value={downloadUrl} size={200} />
              </div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                QR 코드를 스캔하여 이미지를 다운로드하세요
              </p>
              <button
                onClick={() => {
                  setShowQR(false);
                  URL.revokeObjectURL(downloadUrl);
                }}
                className={`px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
