"use client";

type DottedBgProps = {
  opacity?: number;
  color?: string;
  size?: number;
};

/**
 * The lavender dotted background layer. Render once as the first child of
 * any page body — typically wrapped in a `position: relative` flex column.
 *
 * Usage:
 *   <div style={{ position: 'relative', background: COLORS.lav }}>
 *     <DottedBg />
 *     <HeaderBand ... />
 *     ...rest of page (each section needs zIndex 2 to sit above)
 *   </div>
 */
export function DottedBg({
  opacity = 0.5,
  color = "rgba(54,40,30,0.10)",
  size = 14,
}: DottedBgProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle, ${color} 1.5px, transparent 1.8px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}
