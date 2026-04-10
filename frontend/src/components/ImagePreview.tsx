import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';

export default function ImagePreview() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    fetch(`${apiBase}/api/file/${fileId}`)
      .then((res) => {
        if (!res.ok) throw new Error('이미지를 찾을 수 없습니다.');
        return res.blob();
      })
      .then((blob) => {
        setImageUrl(URL.createObjectURL(blob));
        setExpiresAt(new Date(Date.now() + 2 * 86_400_000).toISOString());
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [fileId]);

  const handleDownload = () => {
    if (!imageUrl) return;
    Object.assign(document.createElement('a'), {
      href: imageUrl,
      download: `photo-${fileId}.png`,
    }).click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="card max-w-sm w-full text-center flex flex-col gap-4">
          <p className="text-red-500 font-semibold">{error}</p>
          <button onClick={() => navigate('/')} className="btn-secondary">
            <ArrowLeft size={16} />
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="max-w-2xl mx-auto card flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">이미지 프리뷰</h1>
          <button onClick={() => navigate('/')} className="btn-ghost">
            <ArrowLeft size={16} />
            홈으로
          </button>
        </div>

        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt="preview"
              className="w-full h-auto rounded-xl object-contain max-h-[70vh]"
            />
            <div className="flex justify-between items-center">
              {expiresAt && (
                <p className="text-xs text-zinc-400">
                  만료일: {new Date(expiresAt).toLocaleString()}
                </p>
              )}
              <button onClick={handleDownload} className="btn-primary ml-auto">
                <Download size={16} />
                다운로드
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
