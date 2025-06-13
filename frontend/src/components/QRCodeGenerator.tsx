import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  url,
  size = 200,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-xl">
        <QRCodeSVG value={url} size={size} level="H" includeMargin={true} />
      </div>
      <p className="text-sm text-gray-600">
        QR 코드를 스캔하여 링크로 이동하세요
      </p>
    </div>
  );
};

export default QRCodeGenerator;
