"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS, FONTS } from "./tokens";

type SfxItem = {
  id: number;
  label: string;
  kind: "soft" | "happy" | "big";
};

/**
 * Floating debug bubble that shows which sound just fired. Listens to a
 * 'bs-sfx' CustomEvent dispatched from your lib/sounds.ts.
 *
 * To enable, add this to every sound function in lib/sounds.ts:
 *
 *   window.dispatchEvent(new CustomEvent('bs-sfx', {
 *     detail: { label: 'shabash!', kind: 'happy' }
 *   }));
 *
 * Then mount <SfxIndicator /> at the root of your app shell. In production
 * you'll likely want to gate this on `process.env.NODE_ENV === 'development'`.
 */
export function SfxIndicator() {
  const [items, setItems] = useState<SfxItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    function on(ev: Event) {
      const detail = (ev as CustomEvent).detail as { label: string; kind: SfxItem["kind"] };
      const id = ++idRef.current;
      setItems((it) => [...it, { id, ...detail }]);
      setTimeout(() => setItems((it) => it.filter((x) => x.id !== id)), 1500);
    }
    window.addEventListener("bs-sfx", on);
    return () => window.removeEventListener("bs-sfx", on);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 100,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 4,
        pointerEvents: "none",
      }}
    >
      {items.map((it) => (
        <div
          key={it.id}
          style={{
            background: COLORS.cream,
            color: COLORS.ink,
            fontFamily: FONTS.body,
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 99,
            border: `1.8px solid ${COLORS.ink}`,
            boxShadow: `2px 2px 0 ${COLORS.ink}`,
            animation: "drift-up 1.4s ease-out forwards",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background:
                it.kind === "big"
                  ? COLORS.red
                  : it.kind === "happy"
                  ? COLORS.green
                  : COLORS.ink45,
            }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}
