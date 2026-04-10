import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UrlQRModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-xs flex flex-col items-center gap-4">
        <div className="w-full flex justify-between items-center">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            현재 페이지 QR 코드
          </h3>
          <button onClick={onClose} className="btn-ghost">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 bg-white rounded-xl">
          <QRCodeSVG value={window.location.href} size={180} level="H" includeMargin />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          QR 코드를 스캔하여 이 페이지로 이동하세요
        </p>

        <button onClick={onClose} className="btn-secondary w-full">닫기</button>
      </div>
    </div>
  );
}
