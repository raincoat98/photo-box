import React, { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, Download, RefreshCcw, Layout, Timer } from "lucide-react";
import * as htmlToImage from "html-to-image";
import imageCompression from "browser-image-compression";
import frameBG from "./assets/frame/bg.png";

const backgrounds = [
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop",
];

const templates = [
  {
    id: "grid",
    name: "2x2 Grid",
    layout: "grid grid-cols-2 gap-2",
    itemStyle: "aspect-[3/4]",
    maxPhotos: 4,
  },
  {
    id: "vertical",
    name: "Vertical Strip",
    layout: "grid grid-cols-1 gap-2",
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
  const webcamRef = useRef<Webcam>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

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
            setPhotos((prev) => [...prev, base64data]);
          };
        } catch (error) {
          console.error("Error processing image:", error);
          setPhotos((prev) => [...prev, imageSrc]);
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
    if (resultRef.current === null) {
      return;
    }

    htmlToImage
      .toPng(resultRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
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
          const link = document.createElement("a");
          link.download = "life4cut.png";
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error processing final image:", error);
          // 압축 실패시 원본 이미지 다운로드
          const link = document.createElement("a");
          link.download = "life4cut.png";
          link.href = dataUrl;
          link.click();
        }
      })
      .catch((err) => {
        console.error("Error downloading image:", err);
      });
  }, []);

  useEffect(() => {
    if (!selectedTemplate.frameUrl) return;
    const img = new window.Image();
    img.src = selectedTemplate.frameUrl;
    img.onload = () => {
      setFrameSize({ width: img.width, height: img.height });
    };
  }, [selectedTemplate.frameUrl]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto flex flex-row gap-8">
        {/* 왼쪽: 메인(카메라/결과) */}
        <div className="flex-1 flex flex-col gap-8">
          <h1 className="text-3xl font-bold text-center mb-8">포토 부스</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-4 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setContinuousMode(!continuousMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    continuousMode
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Camera size={18} />
                  연속 촬영
                </button>
                {continuousMode && (
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                    <Timer size={16} />
                    <select
                      value={continuousInterval}
                      onChange={(e) =>
                        setContinuousInterval(Number(e.target.value))
                      }
                      className="bg-transparent border-none focus:ring-0 text-sm"
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
                  className="w-full rounded-lg"
                  videoConstraints={{
                    width: { ideal: 3840 },
                    height: { ideal: 2160 },
                    facingMode: "user",
                    aspectRatio: 1.777777778,
                  }}
                  style={{
                    objectFit: "cover",
                    imageRendering: "crisp-edges",
                  }}
                />
                {timer !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <span className="text-white text-7xl font-bold">
                      {timer}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                  <button
                    onClick={startTimer}
                    disabled={
                      photos.length >= selectedTemplate.maxPhotos ||
                      timer !== null
                    }
                    className={`px-8 py-3 rounded-full shadow-lg transition-all flex items-center gap-2 ${
                      photos.length >= selectedTemplate.maxPhotos
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : timer !== null
                        ? "bg-yellow-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600"
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
            <div className="bg-white p-6 rounded-lg shadow-lg">
              {selectedTemplate.id === "frame-vertical-3cut" ? (
                <div
                  ref={resultRef}
                  style={{
                    width: frameSize.width || 320,
                    height: frameSize.height || 800,
                    position: "relative",
                    background: "#fff",
                    margin: "0 auto",
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
              ) : (
                <div
                  ref={resultRef}
                  className="relative bg-white rounded-lg overflow-hidden"
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
                        className={`${selectedTemplate.itemStyle} bg-gray-200 rounded-lg overflow-hidden`}
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

              <div className="mt-4 flex gap-4">
                <button
                  onClick={resetPhotos}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={20} /> 초기화
                </button>
                <button
                  onClick={downloadResult}
                  disabled={photos.length < selectedTemplate.maxPhotos}
                  className={`flex-1 px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 ${
                    photos.length < selectedTemplate.maxPhotos
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  <Download size={20} /> 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* 오른쪽: 사이드바(템플릿/배경 선택) */}
        <div className="w-64 flex flex-col gap-6 sticky top-8 self-start">
          {/* Template Selection */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
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
                  className={`p-2 rounded border text-xs transition-all ${
                    selectedTemplate.id === template.id
                      ? "border-blue-500 bg-blue-50 shadow"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
          {/* Background Selection */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">배경</h2>
            <div className="grid grid-cols-1 gap-2">
              {backgrounds.map((bg, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedBackground(bg)}
                  className={`rounded-lg overflow-hidden border-2 transition-all w-full aspect-video ${
                    selectedBackground === bg
                      ? "border-blue-500 shadow"
                      : "border-gray-200 hover:border-blue-300"
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
        </div>
      </div>
    </div>
  );
}

export default App;
