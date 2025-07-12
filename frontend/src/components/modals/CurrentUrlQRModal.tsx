import React from "react";
import QRCodeGenerator from "../QRCodeGenerator";

interface CurrentUrlQRModalProps {
  show: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const CurrentUrlQRModal: React.FC<CurrentUrlQRModalProps> = ({
  show,
  onClose,
  isDarkMode,
}) => {
  if (!show) return null;

  return (
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
            현재 페이지 QR 코드
          </h3>
          <QRCodeGenerator url={window.location.href} />
          <button
            onClick={onClose}
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
  );
};

export default CurrentUrlQRModal;
