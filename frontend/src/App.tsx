import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, QrCode } from 'lucide-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Webcam from 'react-webcam';
import { templates, frameTemplates, backgrounds } from './constants';
import { Template, FrameTemplate, Resolution } from './types';
import { useCamera } from './hooks/useCamera';
import { useUpload } from './hooks/useUpload';
import Camera from './components/Camera';
import Result from './components/Result';
import Sidebar from './components/Sidebar';
import ImagePreview from './components/ImagePreview';
import QRModal from './components/modals/QRModal';
import FramePreviewModal from './components/modals/FramePreviewModal';
import UrlQRModal from './components/modals/UrlQRModal';

function PhotoBooth() {
  const [isDark, setIsDark] = useState(true);
  const [background, setBackground] = useState(backgrounds[0]);
  const [template, setTemplate] = useState<Template>(templates[0]);
  const [frameTemplate, setFrameTemplate] = useState<FrameTemplate | null>(null);
  const [pendingFrame, setPendingFrame] = useState<FrameTemplate | null>(null);
  const [showFramePreview, setShowFramePreview] = useState(false);
  const [showUrlQR, setShowUrlQR] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [continuousInterval, setContinuousInterval] = useState(3);
  const [resolution, setResolution] = useState<Resolution>('medium');
  const [isMirrored, setIsMirrored] = useState(true);

  const webcamRef = useRef<Webcam>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const camera = useCamera({
    template,
    frameTemplate,
    resolution,
    continuousMode,
    continuousInterval,
    webcamRef,
  });

  const upload = useUpload(camera.multiplier);

  const handleTemplateChange = (t: Template) => {
    setTemplate(t);
    setFrameTemplate(null);
    camera.reset();
  };

  const handleFrameSelect = (f: FrameTemplate) => {
    setPendingFrame(f);
    setShowFramePreview(true);
  };

  const confirmFrame = () => {
    if (pendingFrame) {
      setFrameTemplate(pendingFrame);
      camera.reset();
    }
    setShowFramePreview(false);
    setPendingFrame(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: main content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <header className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">포토 부스</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                당신의 소중한 순간을 담아보세요
              </p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Camera
              webcamRef={webcamRef}
              isMirrored={isMirrored}
              setIsMirrored={setIsMirrored}
              continuousMode={continuousMode}
              setContinuousMode={setContinuousMode}
              continuousInterval={continuousInterval}
              setContinuousInterval={setContinuousInterval}
              timer={camera.timer}
              isCapturing={camera.isCapturing}
              photos={camera.photos}
              maxPhotos={camera.maxPhotos}
              aspectRatio={camera.aspectRatio}
              cameraSize={camera.cameraSize}
              onShoot={camera.shoot}
              onReset={camera.reset}
            />
            <Result
              resultRef={resultRef}
              template={template}
              frameTemplate={frameTemplate}
              background={background}
              photos={camera.photos}
              maxPhotos={camera.maxPhotos}
              resolution={resolution}
              setResolution={setResolution}
              isDownloading={upload.isDownloading}
              isUploading={upload.isUploading}
              onDownload={() => upload.download(resultRef)}
              onQR={() => upload.uploadForQR(resultRef)}
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <Sidebar
          templates={templates}
          frameTemplates={frameTemplates}
          backgrounds={backgrounds}
          selectedTemplate={template}
          selectedFrameTemplate={frameTemplate}
          selectedBackground={background}
          onTemplateChange={handleTemplateChange}
          onFrameSelect={handleFrameSelect}
          onBackgroundChange={setBackground}
        />
      </div>

      <QRModal
        open={!!upload.uploadedFile}
        onClose={upload.reset}
        uploadedFile={upload.uploadedFile}
      />
      <FramePreviewModal
        open={showFramePreview}
        onClose={() => {
          setShowFramePreview(false);
          setPendingFrame(null);
        }}
        onConfirm={confirmFrame}
        frameTemplate={pendingFrame}
      />
      <UrlQRModal open={showUrlQR} onClose={() => setShowUrlQR(false)} />

      <button
        onClick={() => setShowUrlQR(true)}
        className="fixed bottom-6 right-6 p-3.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white shadow-lg transition-colors"
      >
        <QrCode size={22} />
      </button>

      {upload.error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm whitespace-nowrap">
          {upload.error}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhotoBooth />} />
        <Route path="/preview/:fileId" element={<ImagePreview />} />
      </Routes>
    </BrowserRouter>
  );
}
