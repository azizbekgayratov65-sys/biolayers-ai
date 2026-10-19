"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

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

/*
  A figure that opens full-size in a native <dialog> (focus trap and
  Escape come from the browser). An optional overlay, such as a
  segmentation mask, can be switched on and off in both views.
*/
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const captionId = useId();

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const picture = (large: boolean) => (
    <div className="relative">
      <Image
        src={src}
        unoptimized
        alt={alt}
        width={width}
        height={height}
        className={`h-auto w-full ${large ? "max-h-[78vh] object-contain" : ""}`}
      />
      {overlaySrc && (
        <Image
          src={overlaySrc}
          unoptimized
          alt={overlayAlt || ""}
          width={width}
          height={height}
          className={`absolute inset-0 h-auto w-full transition-opacity duration-200 ${
            showOverlay ? "opacity-100" : "opacity-0"
          } ${large ? "max-h-[78vh] object-contain" : ""}`}
        />
      )}
    </div>
  );

  const overlaySwitch = overlaySrc ? (
    <button
      type="button"
      role="switch"
      aria-checked={showOverlay}
      onClick={() => setShowOverlay((on) => !on)}
      className="inline-flex min-h-10 items-center gap-2.5 rounded-md px-2 text-sm text-ink transition-colors hover:bg-white/[0.05]"
    >
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 rounded-full transition-colors ${
          showOverlay ? "bg-hoechst" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-field transition-transform ${
            showOverlay ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      Segmentation overlay
    </button>
  ) : null;

  return (
    <>
      <figure id={idPrefix}>
        <div className="overflow-hidden rounded-[20px] border border-teal-500/25 bg-black shadow-2xl">
          {picture(false)}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {overlaySwitch}
          <button
            type="button"
            onClick={openDialog}
            className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm text-graphite transition-colors hover:bg-white/[0.05] hover:text-ink"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
            View full size
          </button>
        </div>
        <figcaption id={captionId} className="mt-2 max-w-prose text-sm leading-relaxed text-graphite">
          {caption}
        </figcaption>
      </figure>

      <dialog
        ref={dialogRef}
        aria-describedby={captionId}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
        className="m-auto max-h-[96vh] w-[min(96vw,1400px)] rounded-[24px] border border-teal-400/35 bg-[#060c16]/95 shadow-2xl backdrop-blur-2xl p-0 text-ink backdrop:bg-black/85"
      >
        <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2">
          {overlaySwitch ?? <span />}
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close full-size view"
            className="flex h-10 w-10 items-center justify-center rounded-md text-graphite transition-colors hover:bg-white/[0.06] hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4">{picture(true)}</div>
        <p className="px-4 pb-4 text-sm text-graphite">{caption}</p>
      </dialog>
    </>
  );
}
