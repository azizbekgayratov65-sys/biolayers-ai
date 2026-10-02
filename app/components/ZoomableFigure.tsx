"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

type ZoomableFigureProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  overlaySrc?: string;
  overlayAlt?: string;
  idPrefix: string;
};

export default function ZoomableFigure({
  src,
  alt,
  width,
  height,
  caption,
  overlaySrc,
  overlayAlt,
  idPrefix,
}: ZoomableFigureProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() !== "input" && target.tagName.toLowerCase() !== "label") {
      setIsZoomed(true);
    }
  };

  const renderContent = (isLightbox: boolean) => (
    <div className="relative overflow-hidden rounded-2xl">
      {overlaySrc && (
        <input
          id={`${idPrefix}-toggle${isLightbox ? "-lb" : ""}`}
          type="checkbox"
          defaultChecked
          className="peer sr-only"
        />
      )}
      <Image
        src={src}
        unoptimized
        alt={alt}
        width={width}
        height={height}
        className={`h-auto w-full ${isLightbox ? "max-h-[90vh] object-contain" : ""}`}
      />
      {overlaySrc && (
        <>
          <Image
            src={overlaySrc}
            unoptimized
            alt={overlayAlt || ""}
            width={width}
            height={height}
            className={`absolute inset-0 h-auto w-full opacity-0 transition-opacity peer-checked:opacity-100 ${isLightbox ? "max-h-[90vh] object-contain" : ""}`}
          />
          <label
            htmlFor={`${idPrefix}-toggle${isLightbox ? "-lb" : ""}`}
            className="absolute right-3 top-3 cursor-pointer rounded-full border border-teal-200/30 bg-[#04080e]/80 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-teal-200 backdrop-blur-xl transition hover:border-teal-200/60 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-300"
          >
            Toggle overlay
          </label>
        </>
      )}
    </div>
  );

  return (
    <>
      <figure className="overflow-hidden rounded-[26px] border border-teal-200/20 bg-[#04080e]/90 p-4 backdrop-blur-2xl">
        <div className="group relative cursor-zoom-in" onClick={handleClick}>
          {renderContent(false)}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
            <div className="rounded-full bg-[#0a121d]/80 p-3 text-teal-300 backdrop-blur-md">
              <ZoomIn className="h-6 w-6" />
            </div>
          </div>
        </div>
        <figcaption className="mt-3 text-xs leading-5 text-slate-400">
          {caption}
        </figcaption>
      </figure>

      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-12 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative flex max-h-full max-w-full flex-col items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -right-4 -top-12 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:-right-12"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {renderContent(true)}
            </div>
            <div className="mt-4 max-w-3xl text-center text-sm text-slate-300">
              {caption}
            </div>
          </div>
        </div>
      )}
    </>
  );
}