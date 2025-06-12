import React, { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, Download, RefreshCcw, Layout, Timer } from "lucide-react";
import * as htmlToImage from "html-to-image";
import imageCompression from "browser-image-compression";

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
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
                  <span className="text-white text-7xl font-bold">{timer}</span>
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

        {/* Template Selection */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layout size={24} />
            템플릿 선택
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setPhotos([]);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTemplate.id === template.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className="text-sm font-medium">{template.name}</div>
                <div
                  className={`mt-2 w-full aspect-video bg-gray-100 rounded flex items-center justify-center ${
                    template.id === "vertical"
                      ? "flex-col space-y-1"
                      : template.id === "horizontal"
                      ? "flex-row space-x-1"
                      : "grid grid-cols-2 gap-1"
                  }`}
                >
                  {[...Array(template.maxPhotos)].map((_, i) => (
                    <div key={i} className="bg-gray-300 w-4 h-4 rounded-sm" />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Selection */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">배경 선택</h2>
          <div className="grid grid-cols-3 gap-4">
            {backgrounds.map((bg, index) => (
              <button
                key={index}
                onClick={() => setSelectedBackground(bg)}
                className={`aspect-video rounded-lg overflow-hidden border-4 transition-all ${
                  selectedBackground === bg
                    ? "border-blue-500 shadow-lg"
                    : "border-transparent hover:border-blue-300"
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
  );
}

export default App;
