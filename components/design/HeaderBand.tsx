"use client";

import { ReactNode } from "react";
import { COLORS, FONTS, BORDER, SHADOW } from "./tokens";
const W = '#fff' // @design-allow: white literal
import { Cutting } from "./Cutting";
import { Tag } from "./Tag";

type HeaderBandProps = {
  tag?: string;
  title: string;
  bg?: string;
  onBack?: () => void;
  /**
   * What to put in the right corner. Defaults to a small Cutting.
   * Pass `null` to hide entirely, or any node to override.
   */
  right?: ReactNode | null;
};

/**
 * The peach-gradient (or palette-matched) hero band that crowns every
 * sub-page of the app. Pinned to the top, with a 4px hard offset shadow
 * under it that becomes a subtle visual rhythm across screens.
 *
 * The 52px top padding accounts for iOS status-bar height (notch ~47px +
 * 5px gap). Reduce only if you're rendering inside a different shell.
 */
export function HeaderBand({
  tag,
  title,
  bg = COLORS.peach,
  onBack,
  right,
}: HeaderBandProps) {
  return (
    <div
      style={{
        position: "relative",
        padding: "52px 20px 18px",
        background: bg,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        borderBottom: BORDER.sticker,
        boxShadow: SHADOW.headerBand,
        zIndex: 2,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {onBack ? (
          <button
            onClick={onBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              background: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="back"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div style={{ width: 40 }} />
        )}
        {right === null ? null : right ?? (
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Cutting size={74} />
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        {tag && <Tag>{tag}</Tag>}
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.ink,
            lineHeight: 1.05,
            marginTop: 6,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
