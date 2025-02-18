import React, { useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { Camera, Download, RefreshCcw, Layout } from "lucide-react";
import * as htmlToImage from "html-to-image";

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
  const webcamRef = useRef<Webcam>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const capture = useCallback(() => {
    if (webcamRef.current && photos.length < selectedTemplate.maxPhotos) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhotos((prev) => [...prev, imageSrc]);
      }
    }
  }, [photos, selectedTemplate.maxPhotos]);

  const resetPhotos = () => {
    setPhotos([]);
  };

  const downloadResult = useCallback(() => {
    if (resultRef.current === null) {
      return;
    }

    htmlToImage
      .toPng(resultRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "life4cut.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Error downloading image:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Photo Booth</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user",
                }}
              />
              <button
                onClick={capture}
                disabled={photos.length >= selectedTemplate.maxPhotos}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Camera size={20} /> Capture ({photos.length}/
                {selectedTemplate.maxPhotos})
              </button>
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
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Photo {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={resetPhotos}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <RefreshCcw size={20} /> Reset
              </button>
              <button
                onClick={downloadResult}
                disabled={photos.length < selectedTemplate.maxPhotos}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download size={20} /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layout size={24} />
            Select Template
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
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
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
          <h2 className="text-xl font-semibold mb-4">Select Background</h2>
          <div className="grid grid-cols-3 gap-4">
            {backgrounds.map((bg, index) => (
              <button
                key={index}
                onClick={() => setSelectedBackground(bg)}
                className={`aspect-video rounded-lg overflow-hidden border-4 ${
                  selectedBackground === bg
                    ? "border-blue-500"
                    : "border-transparent"
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
