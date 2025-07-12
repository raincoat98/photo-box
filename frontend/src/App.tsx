import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Sun, Moon, QrCode } from "lucide-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ImagePreview from "./components/ImagePreview";
import CameraSection from "./components/CameraSection";
import ResultSection from "./components/ResultSection";
import Sidebar from "./components/Sidebar";
import QRCodeModal from "./components/modals/QRCodeModal";
import FramePreviewModal from "./components/modals/FramePreviewModal";
import CurrentUrlQRModal from "./components/modals/CurrentUrlQRModal";
import ErrorMessage from "./components/ErrorMessage";
import { usePhotoCapture } from "./hooks/usePhotoCapture";
import { useUpload } from "./hooks/useUpload";
import { templates, frameTemplates, backgrounds } from "./constants";
import { Template, FrameTemplate, Resolution } from "./types";

function App() {
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    templates[0]
  );
  const [selectedFrameTemplate, setSelectedFrameTemplate] =
    useState<FrameTemplate | null>(null);
  const [showFramePreview, setShowFramePreview] = useState(false);
  const [previewFrameTemplate, setPreviewFrameTemplate] =
    useState<FrameTemplate | null>(null);
  const [continuousMode, setContinuousMode] = useState(false);
  const [continuousInterval, setContinuousInterval] = useState(3);
  const [resolution, setResolution] = useState<Resolution>("medium");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showCurrentUrlQR, setShowCurrentUrlQR] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const {
    photos,
    timer,
    isCapturing,
    setPhotos,
    resetPhotos,
    startTimer,
    getCameraAspectRatio,
    getCameraSize,
    getResolutionMultiplier,
  } = usePhotoCapture({
    selectedTemplate,
    selectedFrameTemplate,
    resolution,
    continuousMode,
    continuousInterval,
    webcamRef,
  });

  const {
    isDownloading,
    isUploading,
    uploadError,
    uploadedFile,
    downloadResult,
    generateQRCode,
    resetUpload,
  } = useUpload({
    getResolutionMultiplier,
  });

  const handleFrameTemplateSelect = (template: FrameTemplate) => {
    setPreviewFrameTemplate(template);
    setShowFramePreview(true);
  };

  const confirmFrameTemplate = () => {
    if (previewFrameTemplate) {
      setSelectedFrameTemplate(previewFrameTemplate);
      setPhotos([]);
      setShowFramePreview(false);
      setPreviewFrameTemplate(null);
    }
  };

  const handleQRCodeGeneration = () => {
    generateQRCode(resultRef);
  };

  const handleDownload = () => {
    downloadResult(resultRef);
  };

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedFrameTemplate(null);
    setPhotos([]);
  };

  const handleCloseQR = () => {
    setShowQR(false);
    resetUpload();
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div
              className={`min-h-screen ${
                isDarkMode ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pt-8 pb-8 px-4">
                {/* 왼쪽: 메인(카메라/결과) */}
                <div className="flex-1 flex flex-col gap-8">
                  {/* 헤더 */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    <div className="relative group">
                      <h1
                        className={`text-3xl sm:text-4xl font-bold text-center transition-all duration-500 animate-fade-in relative z-10 flex flex-col items-center gap-2 ${
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

                  {/* 카메라 및 결과 섹션 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CameraSection
                      webcamRef={webcamRef}
                      selectedTemplate={selectedTemplate}
                      selectedFrameTemplate={selectedFrameTemplate}
                      continuousMode={continuousMode}
                      setContinuousMode={setContinuousMode}
                      continuousInterval={continuousInterval}
                      setContinuousInterval={setContinuousInterval}
                      isMirrored={isMirrored}
                      setIsMirrored={setIsMirrored}
                      getCameraAspectRatio={getCameraAspectRatio}
                      getCameraSize={getCameraSize}
                      timer={timer}
                      isCapturing={isCapturing}
                      photos={photos}
                      startTimer={startTimer}
                      resetPhotos={resetPhotos}
                      isDarkMode={isDarkMode}
                    />

                    <ResultSection
                      resultRef={resultRef}
                      selectedTemplate={selectedTemplate}
                      selectedFrameTemplate={selectedFrameTemplate}
                      selectedBackground={selectedBackground}
                      photos={photos}
                      resolution={resolution}
                      setResolution={setResolution}
                      downloadResult={handleDownload}
                      generateQRCode={handleQRCodeGeneration}
                      isDownloading={isDownloading}
                      isUploading={isUploading}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>

                {/* 오른쪽: 사이드바 */}
                <Sidebar
                  templates={templates}
                  frameTemplates={frameTemplates}
                  backgrounds={backgrounds}
                  selectedTemplate={selectedTemplate}
                  selectedFrameTemplate={selectedFrameTemplate}
                  selectedBackground={selectedBackground}
                  setSelectedTemplate={handleTemplateChange}
                  handleFrameTemplateSelect={handleFrameTemplateSelect}
                  setSelectedBackground={setSelectedBackground}
                  resetPhotos={resetPhotos}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* QR 코드 모달 */}
              <QRCodeModal
                show={showQR && uploadedFile !== null}
                onClose={handleCloseQR}
                uploadedFile={uploadedFile}
                isDarkMode={isDarkMode}
              />

              {/* 프레임 미리보기 모달 */}
              <FramePreviewModal
                show={showFramePreview}
                onClose={() => {
                  setShowFramePreview(false);
                  setPreviewFrameTemplate(null);
                }}
                onConfirm={confirmFrameTemplate}
                previewFrameTemplate={previewFrameTemplate}
                isDarkMode={isDarkMode}
              />

              {/* 현재 URL QR 코드 모달 */}
              <CurrentUrlQRModal
                show={showCurrentUrlQR}
                onClose={() => setShowCurrentUrlQR(false)}
                isDarkMode={isDarkMode}
              />

              {/* 현재 URL QR 코드 버튼 */}
              <button
                onClick={() => setShowCurrentUrlQR(true)}
                className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
              >
                <QrCode size={24} />
              </button>

              {/* 에러 메시지 */}
              <ErrorMessage message={uploadError} show={Boolean(uploadError)} />
            </div>
          }
        />
        <Route path="/preview/:fileId" element={<ImagePreview />} />
      </Routes>
    </Router>
  );
}

export default App;
