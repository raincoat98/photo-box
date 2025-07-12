import { useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { Template, FrameTemplate, Resolution } from "../types";
import Webcam from "react-webcam";

interface UsePhotoCaptureProps {
  selectedTemplate: Template;
  selectedFrameTemplate: FrameTemplate | null;
  resolution: Resolution;
  continuousMode: boolean;
  continuousInterval: number;
  webcamRef: React.RefObject<Webcam>;
}

export const usePhotoCapture = ({
  selectedTemplate,
  selectedFrameTemplate,
  resolution,
  continuousMode,
  continuousInterval,
  webcamRef,
}: UsePhotoCaptureProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [timer, setTimer] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const getResolutionMultiplier = useCallback(() => {
    return {
      low: 1,
      medium: 2,
      high: 3,
    }[resolution];
  }, [resolution]);

  const getPhotoSize = useCallback(() => {
    const multiplier = getResolutionMultiplier();
    if (selectedFrameTemplate) {
      return {
        width: (selectedFrameTemplate.width || 200) * multiplier,
        height: (selectedFrameTemplate.height || 600) * multiplier,
      };
    }
    // 템플릿의 동적 크기 속성 사용
    if (selectedTemplate.width && selectedTemplate.height) {
      return {
        width: selectedTemplate.width * multiplier,
        height: selectedTemplate.height * multiplier,
      };
    }
    // 기본값 (fallback)
    return {
      width: 300 * multiplier,
      height: 400 * multiplier,
    };
  }, [
    selectedFrameTemplate,
    selectedTemplate.width,
    selectedTemplate.height,
    getResolutionMultiplier,
  ]);

  const getCameraAspectRatio = useCallback(() => {
    if (
      selectedFrameTemplate &&
      selectedFrameTemplate.photoPositions &&
      selectedFrameTemplate.photoPositions.length > 0
    ) {
      const pos = selectedFrameTemplate.photoPositions[0];
      const photoWidth = pos.width * (selectedFrameTemplate.width || 200);
      const photoHeight = pos.height * (selectedFrameTemplate.height || 600);
      return photoWidth / photoHeight;
    } else if (selectedTemplate.aspectRatio) {
      return selectedTemplate.aspectRatio;
    } else if (selectedTemplate.itemStyle) {
      const match = selectedTemplate.itemStyle.match(/aspect-\[(\d+)\/(\d+)\]/);
      if (match) {
        return Number(match[1]) / Number(match[2]);
      }
    }
    return 3 / 4;
  }, [
    selectedFrameTemplate,
    selectedTemplate.aspectRatio,
    selectedTemplate.itemStyle,
  ]);

  const getCameraSize = useCallback(() => {
    // 웹캠 표시 크기는 해상도와 무관하게 고정
    if (
      selectedFrameTemplate &&
      selectedFrameTemplate.photoPositions &&
      selectedFrameTemplate.photoPositions.length > 0
    ) {
      const pos = selectedFrameTemplate.photoPositions[0];
      const photoWidth = pos.width * (selectedFrameTemplate.width || 200);
      const photoHeight = pos.height * (selectedFrameTemplate.height || 600);
      return {
        width: photoWidth,
        height: photoHeight,
      };
    }
    // 템플릿의 동적 크기 속성 사용
    if (selectedTemplate.width && selectedTemplate.height) {
      return {
        width: selectedTemplate.width,
        height: selectedTemplate.height,
      };
    }
    // 기본값 (fallback)
    return {
      width: 300,
      height: 400,
    };
  }, [selectedFrameTemplate, selectedTemplate.width, selectedTemplate.height]);

  const capture = useCallback(async () => {
    const maxPhotos = selectedFrameTemplate
      ? selectedFrameTemplate.maxPhotos
      : selectedTemplate.maxPhotos;
    if (webcamRef.current && photos.length < maxPhotos) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const response = await fetch(imageSrc);
          const blob = await response.blob();
          const file = new File([blob], "photo.png", { type: "image/png" });

          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: getPhotoSize().width,
            useWebWorker: true,
            fileType: "image/png",
          };

          const compressedFile = await imageCompression(file, options);

          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            setPhotos((prev) => {
              if (prev.length >= maxPhotos) {
                return prev;
              }
              return [...prev, base64data];
            });
          };
        } catch (error) {
          console.error("Error processing image:", error);
          setPhotos((prev) => {
            if (prev.length >= maxPhotos) {
              return prev;
            }
            return [...prev, imageSrc];
          });
        }
      }
    }
  }, [
    photos,
    selectedFrameTemplate,
    selectedTemplate.maxPhotos,
    getPhotoSize,
    webcamRef,
  ]);

  const startTimer = useCallback(() => {
    const maxPhotos = selectedFrameTemplate
      ? selectedFrameTemplate.maxPhotos
      : selectedTemplate.maxPhotos;
    if (photos.length >= maxPhotos) return;
    if (continuousMode) {
      setTimer(continuousInterval);
    } else {
      capture();
    }
  }, [
    photos.length,
    selectedFrameTemplate,
    selectedTemplate.maxPhotos,
    continuousMode,
    continuousInterval,
    capture,
  ]);

  const resetPhotos = useCallback(() => {
    setPhotos([]);
    setTimer(null);
  }, []);

  useEffect(() => {
    if (timer === null) return;

    if (timer === 0) {
      setIsCapturing(true);
      capture();
      setTimer(null);

      const maxPhotos = selectedFrameTemplate
        ? selectedFrameTemplate.maxPhotos
        : selectedTemplate.maxPhotos;
      if (continuousMode && photos.length < maxPhotos - 1) {
        setTimeout(() => {
          setIsCapturing(false);
          setTimer(continuousInterval);
        }, 1500);
      } else {
        setTimeout(() => {
          setIsCapturing(false);
        }, 1000);
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    timer,
    capture,
    continuousMode,
    photos.length,
    selectedFrameTemplate,
    selectedTemplate.maxPhotos,
    continuousInterval,
  ]);

  return {
    photos,
    timer,
    isCapturing,
    setPhotos,
    resetPhotos,
    startTimer,
    getCameraAspectRatio,
    getCameraSize,
    getResolutionMultiplier,
  };
};
