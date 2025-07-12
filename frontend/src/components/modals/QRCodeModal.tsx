import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { UploadedFile } from "../../types";

interface QRCodeModalProps {
  show: boolean;
  onClose: () => void;
  uploadedFile: UploadedFile | null;
  isDarkMode: boolean;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  show,
  onClose,
  uploadedFile,
  isDarkMode,
}) => {
  if (!show || !uploadedFile) return null;

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
            QR 코드로 다운로드
          </h3>
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG
              value={`${window.location.protocol}//${
                window.location.hostname
              }/preview/${uploadedFile.url.split("/").pop()}`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            QR 코드를 스캔하여 이미지를 다운로드하세요
          </p>
          <p
            className={`text-xs ${
              isDarkMode ? "text-purple-300" : "text-pink-600"
            }`}
          >
            만료일: {new Date(uploadedFile.expiresAt).toLocaleString()}
          </p>
          <div className="flex flex-col items-center gap-2">
            <a
              href={`/preview/${uploadedFile.url.split("/").pop()}`}
              className={`text-sm underline ${
                isDarkMode ? "text-purple-300" : "text-pink-600"
              }`}
            >
              직접 링크 열기
            </a>
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
    </div>
  );
};

export default QRCodeModal;
