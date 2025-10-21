"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Button from "@/components/visual/Button";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 80,
          },
          1, // Aspect ratio 1:1 (quadrado)
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(crop);
    },
    [],
  );

  const onDownloadCropClick = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      "image/png",
      1,
    );
  }, [completedCrop, onCropComplete]);

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-center">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1} // Força formato quadrado
          minWidth={100}
          minHeight={100}
        >
          <img
            ref={imgRef}
            alt="Ajuste a área da logo"
            src={imageSrc}
            style={{ maxHeight: "500px", maxWidth: "100%" }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={onCancel}
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          onClick={onDownloadCropClick}
          variant="primary"
        >
          Salvar Logo
        </Button>
      </div>
    </div>
  );
}
