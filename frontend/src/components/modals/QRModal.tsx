import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { UploadedFile } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  uploadedFile: UploadedFile | null;
}

export default function QRModal({ open, onClose, uploadedFile }: Props) {
  if (!open || !uploadedFile) return null;

  const fileId = uploadedFile.url.split('/').pop();
  const previewUrl = `${window.location.protocol}//${window.location.hostname}/preview/${fileId}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-xs flex flex-col items-center gap-4">
        <div className="w-full flex justify-between items-center">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            QR 코드로 다운로드
          </h3>
          <button onClick={onClose} className="btn-ghost">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 bg-white rounded-xl">
          <QRCodeSVG value={previewUrl} size={180} level="H" includeMargin />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          QR 코드를 스캔하여 이미지를 다운로드하세요
        </p>
        <p className="text-xs text-pink-500 dark:text-pink-400">
          만료일: {new Date(uploadedFile.expiresAt).toLocaleString()}
        </p>
        <a
          href={`/preview/${fileId}`}
          className="text-sm text-pink-500 dark:text-pink-400 underline"
        >
          직접 링크 열기
        </a>
        <button onClick={onClose} className="btn-secondary w-full">
          닫기
        </button>
      </div>
    </div>
  );
}
