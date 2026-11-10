"use client";

import { useEffect, useState } from "react";
import { controlClass } from "./fields";

/**
 * Mentor photo upload with a slider that picks which part of the photo shows
 * in the cropped card. The preview uses the same crop as the public card.
 */
export function PhotoPositionField({ photoUrl, defaultPosition }: { photoUrl: string | null; defaultPosition: number }) {
  const [position, setPosition] = useState(defaultPosition);
  const [preview, setPreview] = useState<string | null>(photoUrl);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
        Photo
        <input
          type="file"
          name="photo"
          accept="image/*"
          className={controlClass}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : photoUrl);
          }}
        />
        <span className="text-xs font-normal text-muted">JPG, PNG or WebP, up to 4 MB.</span>
      </label>

      {preview && (
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">Card preview</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-[180px] w-[280px] rounded-xl object-cover" style={{ objectPosition: `50% ${position}%` }} />
          </div>
          <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm font-semibold text-ink">
            Photo position
            <input
              type="range"
              name="photo_position_y"
              min={0}
              max={100}
              step={1}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="accent-brand"
            />
            <span className="flex justify-between text-xs font-normal text-muted">
              <span>Show top</span>
              <span>Centre</span>
              <span>Show bottom</span>
            </span>
            <span className="text-xs font-normal text-muted">Drag until the face sits nicely in the preview, then save.</span>
          </label>
        </div>
      )}
      {!preview && <input type="hidden" name="photo_position_y" value={position} />}
    </div>
  );
}
