import { useState, useCallback, RefObject } from 'react';
import * as htmlToImage from 'html-to-image';
import imageCompression from 'browser-image-compression';
import { UploadedFile } from '../types';
import { API_ENDPOINTS } from '../config';

const COMPRESS_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 3840,
  useWebWorker: true,
  fileType: 'image/png' as const,
};

async function renderNode(node: HTMLDivElement, scale: number): Promise<string> {
  return htmlToImage.toPng(node, {
    quality: 1,
    pixelRatio: scale,
    width: node.offsetWidth * scale,
    height: node.offsetHeight * scale,
    style: { transform: `scale(${scale})`, transformOrigin: 'top left' },
  });
}

async function compressDataUrl(dataUrl: string, filename: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: 'image/png' });
  return imageCompression(file, COMPRESS_OPTIONS);
}

export function useUpload(multiplier: number) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const download = useCallback(
    async (ref: RefObject<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || isDownloading) return;
      setIsDownloading(true);
      try {
        const dataUrl = await renderNode(node, multiplier);
        const file = await compressDataUrl(dataUrl, 'life4cut.png');
        const url = URL.createObjectURL(file);
        Object.assign(document.createElement('a'), {
          download: 'life4cut.png',
          href: url,
        }).click();
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => setIsDownloading(false), 1000);
      }
    },
    [isDownloading, multiplier]
  );

  const uploadForQR = useCallback(
    async (ref: RefObject<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || isUploading || isDownloading) return;
      setIsUploading(true);
      setError(null);
      try {
        const dataUrl = await renderNode(node, multiplier);
        const file = await compressDataUrl(dataUrl, 'life4cut.png');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(API_ENDPOINTS.UPLOAD, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.details || '업로드 실패');
        }
        setUploadedFile(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : '업로드 중 오류가 발생했습니다.');
      } finally {
        setTimeout(() => setIsUploading(false), 1000);
      }
    },
    [isUploading, isDownloading, multiplier]
  );

  const reset = useCallback(() => {
    setUploadedFile(null);
    setError(null);
  }, []);

  return { isDownloading, isUploading, error, uploadedFile, download, uploadForQR, reset };
}
