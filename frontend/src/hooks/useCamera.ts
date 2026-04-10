import { useState, useCallback, useEffect, useMemo, RefObject } from 'react';
import imageCompression from 'browser-image-compression';
import Webcam from 'react-webcam';
import { Template, FrameTemplate, Resolution } from '../types';

const MULTIPLIERS: Record<Resolution, number> = { low: 1, medium: 2, high: 3 };

interface Options {
  template: Template;
  frameTemplate: FrameTemplate | null;
  resolution: Resolution;
  continuousMode: boolean;
  continuousInterval: number;
  webcamRef: RefObject<Webcam>;
}

export function useCamera({
  template,
  frameTemplate,
  resolution,
  continuousMode,
  continuousInterval,
  webcamRef,
}: Options) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [timer, setTimer] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const maxPhotos = frameTemplate?.maxPhotos ?? template.maxPhotos;
  const multiplier = MULTIPLIERS[resolution];

  const aspectRatio = useMemo(() => {
    if (frameTemplate) {
      const pos = frameTemplate.photoPositions[0];
      return (pos.width * frameTemplate.width) / (pos.height * frameTemplate.height);
    }
    return template.aspectRatio;
  }, [frameTemplate, template.aspectRatio]);

  const cameraSize = useMemo(() => {
    if (frameTemplate) {
      const pos = frameTemplate.photoPositions[0];
      return {
        width: pos.width * frameTemplate.width,
        height: pos.height * frameTemplate.height,
      };
    }
    return { width: template.width, height: template.height };
  }, [frameTemplate, template.width, template.height]);

  const capture = useCallback(async () => {
    const node = webcamRef.current;
    if (!node || photos.length >= maxPhotos) return;

    const imageSrc = node.getScreenshot();
    if (!imageSrc) return;

    try {
      const blob = await (await fetch(imageSrc)).blob();
      const file = new File([blob], 'photo.png', { type: 'image/png' });
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: cameraSize.width * multiplier,
        useWebWorker: true,
        fileType: 'image/png',
      });
      const reader = new FileReader();
      reader.readAsDataURL(compressed);
      reader.onloadend = () =>
        setPhotos((prev) =>
          prev.length >= maxPhotos ? prev : [...prev, reader.result as string]
        );
    } catch {
      setPhotos((prev) =>
        prev.length >= maxPhotos ? prev : [...prev, imageSrc]
      );
    }
  }, [photos.length, maxPhotos, cameraSize.width, multiplier, webcamRef]);

  const shoot = useCallback(() => {
    if (photos.length >= maxPhotos) return;
    if (continuousMode) {
      setTimer(continuousInterval);
    } else {
      capture();
    }
  }, [photos.length, maxPhotos, continuousMode, continuousInterval, capture]);

  const reset = useCallback(() => {
    setPhotos([]);
    setTimer(null);
  }, []);

  useEffect(() => {
    if (timer === null) return;

    if (timer === 0) {
      setIsCapturing(true);
      capture();
      setTimer(null);
      if (continuousMode && photos.length < maxPhotos - 1) {
        setTimeout(() => {
          setIsCapturing(false);
          setTimer(continuousInterval);
        }, 1500);
      } else {
        setTimeout(() => setIsCapturing(false), 1000);
      }
      return;
    }

    const id = setTimeout(() => setTimer((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [timer, capture, continuousMode, photos.length, maxPhotos, continuousInterval]);

  return {
    photos,
    setPhotos,
    timer,
    isCapturing,
    maxPhotos,
    aspectRatio,
    cameraSize,
    multiplier,
    shoot,
    reset,
  };
}
