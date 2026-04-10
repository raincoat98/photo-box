import { X } from 'lucide-react';
import { FrameTemplate } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  frameTemplate: FrameTemplate | null;
}

export default function FramePreviewModal({ open, onClose, onConfirm, frameTemplate }: Props) {
  if (!open || !frameTemplate) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm max-h-[90vh] overflow-y-auto flex flex-col items-center gap-4">
        <div className="w-full flex justify-between items-center">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            프레임 미리보기
          </h3>
          <button onClick={onClose} className="btn-ghost">
            <X size={18} />
          </button>
        </div>

        <img
          src={frameTemplate.frameUrl}
          alt={frameTemplate.name}
          className="w-auto h-auto max-w-full rounded-xl"
          style={{ maxHeight: '60vh' }}
        />

        <p className="text-sm text-zinc-600 dark:text-zinc-400">{frameTemplate.name}</p>

        <div className="flex gap-2 w-full">
          <button onClick={onClose} className="btn-secondary flex-1">취소</button>
          <button onClick={onConfirm} className="btn-primary flex-1">선택</button>
        </div>
      </div>
    </div>
  );
}
