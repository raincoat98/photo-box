import { useState, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import imageCompression from "browser-image-compression";
import { UploadedFile } from "../types";
import { API_ENDPOINTS } from "../config";

interface UseUploadProps {
  getResolutionMultiplier: () => number;
}

export const useUpload = ({ getResolutionMultiplier }: UseUploadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "업로드 실패");
      }

      const data = await response.json();
      setUploadedFile(data);
      return data;
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "파일 업로드에 실패했습니다."
      );
      throw error;
    }
  };

  const downloadResult = useCallback(
    (resultRef: React.RefObject<HTMLDivElement>) => {
      if (resultRef.current === null || isDownloading) return;

      setIsDownloading(true);

      const resolutionMultiplier = getResolutionMultiplier();
      const node = resultRef.current;
      const width = node.offsetWidth * resolutionMultiplier;
      const height = node.offsetHeight * resolutionMultiplier;

      htmlToImage
        .toPng(node, {
          quality: 1.0,
          pixelRatio: resolutionMultiplier,
          width,
          height,
          style: {
            transform: `scale(${resolutionMultiplier})`,
            transformOrigin: "top left",
          },
        })
        .then(async (dataUrl) => {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], "life4cut.png", {
              type: "image/png",
            });

            const options = {
              maxSizeMB: 2,
              maxWidthOrHeight: 3840,
              useWebWorker: true,
              fileType: "image/png",
            };

            const compressedFile = await imageCompression(file, options);

            const url = URL.createObjectURL(compressedFile);
            const link = document.createElement("a");
            link.download = "life4cut.png";
            link.href = url;
            link.click();
          } catch (error) {
            console.error("Error processing final image:", error);
            const link = document.createElement("a");
            link.download = "life4cut.png";
            link.href = dataUrl;
            link.click();
          }
        })
        .catch((err) => {
          console.error("Error downloading image:", err);
        })
        .finally(() => {
          setTimeout(() => {
            setIsDownloading(false);
          }, 1000);
        });
    },
    [getResolutionMultiplier, isDownloading]
  );

  const generateQRCode = useCallback(
    (resultRef: React.RefObject<HTMLDivElement>) => {
      if (resultRef.current === null || isDownloading || isUploading) {
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      const resolutionMultiplier = getResolutionMultiplier();
      const node = resultRef.current;
      const width = node.offsetWidth * resolutionMultiplier;
      const height = node.offsetHeight * resolutionMultiplier;

      htmlToImage
        .toPng(node, {
          quality: 1.0,
          pixelRatio: resolutionMultiplier,
          width,
          height,
          style: {
            transform: `scale(${resolutionMultiplier})`,
            transformOrigin: "top left",
          },
        })
        .then(async (dataUrl) => {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], "life4cut.png", {
              type: "image/png",
            });

            const options = {
              maxSizeMB: 2,
              maxWidthOrHeight: 3840,
              useWebWorker: true,
              fileType: "image/png",
            };

            const compressedFile = await imageCompression(file, options);

            await handleUpload(compressedFile);
          } catch (error) {
            console.error("Error processing image:", error);
            setUploadError(
              error instanceof Error
                ? error.message
                : "이미지 업로드 중 오류가 발생했습니다."
            );
          }
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setUploadError("QR 코드 생성 중 오류가 발생했습니다.");
        })
        .finally(() => {
          setTimeout(() => {
            setIsUploading(false);
          }, 1000);
        });
    },
    [getResolutionMultiplier, isDownloading, isUploading]
  );

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  const resetUpload = useCallback(() => {
    setUploadedFile(null);
    setUploadError(null);
  }, []);

  return {
    isDownloading,
    isUploading,
    uploadError,
    uploadedFile,
    downloadResult,
    generateQRCode,
    clearUploadError,
    resetUpload,
  };
};
