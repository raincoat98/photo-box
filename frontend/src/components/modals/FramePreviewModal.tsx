import React from "react";
import { FrameTemplate } from "../../types";

interface FramePreviewModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  previewFrameTemplate: FrameTemplate | null;
  isDarkMode: boolean;
}

const FramePreviewModal: React.FC<FramePreviewModalProps> = ({
  show,
  onClose,
  onConfirm,
  previewFrameTemplate,
  isDarkMode,
}) => {
  if (!show || !previewFrameTemplate) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`p-6 rounded-2xl shadow-xl border max-w-sm sm:max-w-md lg:max-w-lg w-full max-h-[90vh] overflow-y-auto ${
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
            프레임 미리보기
          </h3>
          <div className="relative bg-white rounded-xl overflow-hidden shadow-lg max-w-full">
            <img
              src={previewFrameTemplate.frameUrl}
              alt={previewFrameTemplate.name}
              className="w-full h-auto object-contain"
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                width: "auto",
                height: "auto",
              }}
            />
          </div>
          <p
            className={`text-sm text-center ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {previewFrameTemplate.name}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? "bg-purple-500 text-white hover:bg-purple-600"
                  : "bg-pink-500 text-white hover:bg-pink-600"
              }`}
            >
              선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FramePreviewModal;
