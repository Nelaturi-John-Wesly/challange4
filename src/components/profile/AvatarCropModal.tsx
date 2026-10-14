"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, Check, Crop } from "lucide-react";

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export function AvatarCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: AvatarCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCrop = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 320;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw circular mask
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Render image with zoom & offset
      const scale = zoom;
      const w = size * scale;
      const h = (img.height / img.width) * w;
      const x = size / 2 - w / 2 + offset.x;
      const y = size / 2 - h / 2 + offset.y;

      ctx.drawImage(img, x, y, w, h);

      const croppedData = canvas.toDataURL("image/jpeg", 0.9);
      onCropComplete(croppedData);
      onClose();
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Adjust Profile Picture</h3>
              <p className="text-[11px] text-slate-400">Drag to reposition, use slider to zoom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Box */}
        <div className="my-5 flex flex-col items-center">
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-amber-500/40 bg-slate-950 cursor-grab active:cursor-grabbing shadow-inner select-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="absolute pointer-events-none origin-center max-w-none transition-transform duration-75"
              style={{
                width: `${100 * zoom}%`,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2">Circular Avatar Preview</span>
        </div>

        {/* Zoom Slider */}
        <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
              Zoom Out
            </span>
            <span className="text-amber-400 font-bold">{Math.round(zoom * 100)}%</span>
            <span className="flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
              Zoom In
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCrop}
            className="bg-amber-600 hover:bg-amber-500 text-white gap-1.5 text-xs font-bold"
          >
            <Check className="w-3.5 h-3.5" />
            Apply & Save Photo
          </Button>
        </div>
      </div>
    </div>
  );
}
