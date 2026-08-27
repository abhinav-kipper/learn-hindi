'use client'

import React from 'react'
import { Sticker, COLORS, FONTS, BORDER } from '@/components/design'
import { speak } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import type { CheatBlock, CheatPair, CheatSection } from '@/lib/dutch/cheatsheet'

const W = '#fff' // @design-allow: white literal

/**
 * Inline markdown subset shared with the theory chapters:
 *   `token`   becomes a butter-bg Dutch-token chip
 *   **bold**  becomes a bold key term
 */
export function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(
        <span
          key={`${keyPrefix}-c${i}`}
          style={{
            background: COLORS.butter,
            border: BORDER.thin,
            borderRadius: 6,
            padding: '0 5px',
            fontSize: '0.92em',
            fontWeight: 700,
            color: COLORS.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {m[1]}
        </span>,
      )
    } else if (m[2] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} style={{ fontWeight: 800, color: COLORS.ink }}>
          {m[2]}
        </strong>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/** Body text with blank-line paragraphs, "- " bullets and "1. " numbered steps. */
export function RichText({ text, size = 14.5 }: { text: string; size?: number }) {
  const lines = text.split('\n')
  const blocks: Array<{ type: 'p' | 'ul' | 'ol'; lines: string[] }> = []
  let para: string[] = []
  let bullets: string[] = []
  let numbers: string[] = []

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', lines: [para.join(' ')] })
      para = []
    }
  }
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: 'ul', lines: bullets })
      bullets = []
    }
  }
  const flushNumbers = () => {
    if (numbers.length) {
      blocks.push({ type: 'ol', lines: numbers })
      numbers = []
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.trim().length === 0) {
      flushPara()
      flushBullets()
      flushNumbers()
    } else if (/^\s*-\s+/.test(line)) {
      flushPara()
      flushNumbers()
      bullets.push(line.replace(/^\s*-\s+/, ''))
    } else if (/^\s*\d+\.\s+/.test(line)) {
      flushPara()
      flushBullets()
      numbers.push(line.replace(/^\s*\d+\.\s+/, ''))
    } else {
      flushBullets()
      flushNumbers()
      para.push(line.trim())
    }
  }
  flushPara()
  flushBullets()
  flushNumbers()

  const base: React.CSSProperties = {
    fontFamily: FONTS.body,
    fontSize: size,
    lineHeight: 1.55,
    color: COLORS.ink60,
    margin: '0 0 10px',
  }

  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === 'p') {
          return (
            <p key={i} style={base}>
              {renderInline(b.lines[0], String(i))}
            </p>
          )
        }
        const ListTag = b.type === 'ul' ? 'ul' : 'ol'
        return (
          <ListTag
            key={i}
            style={{ ...base, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}
          >
            {b.lines.map((li, j) => (
              <li key={j} style={{ lineHeight: 1.5 }}>
                {renderInline(li, `${i}-${j}`)}
              </li>
            ))}
          </ListTag>
        )
      })}
    </>
  )
}

const CALLOUT_STYLE: Record<string, { bg: string; icon: string; label: string }> = {
  rule: { bg: W, icon: '', label: '' },
  tip: { bg: COLORS.mint2, icon: '💡', label: 'tip' },
  pitfall: { bg: COLORS.peach2, icon: '⚠️', label: 'watch out' },
}

function SpeakRow({ pair }: { pair: CheatPair }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <button
        aria-label={`Hear it: ${pair.nl}`}
        onClick={() => {
          playSound('tap')
          speak(pair.nl, 'nl')
        }}
        style={{
          flexShrink: 0,
          width: 30,
          height: 30,
          borderRadius: 99,
          background: COLORS.butter,
          border: BORDER.thin,
          cursor: 'pointer',
          fontSize: 13,
          lineHeight: 1,
          padding: 0,
        }}
      >
        🔊
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 14.5, fontWeight: 700, color: COLORS.ink }}>
          {pair.nl}
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink60 }}>{pair.en}</div>
        {pair.note && (
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 11.5,
              color: COLORS.ink45,
              fontStyle: 'italic',
              marginTop: 2,
            }}
          >
            {pair.note}
          </div>
        )}
      </div>
    </div>
  )
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 13,
        color: COLORS.ink,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

export function BlockView({ block }: { block: CheatBlock }) {
  if (block.kind === 'table') {
    return (
      <Sticker color={W} radius={16} padding={0} style={{ marginBottom: 12, overflow: 'hidden' }}>
        {block.title && (
          <div style={{ padding: '12px 14px 0' }}>
            <BlockTitle>{block.title}</BlockTitle>
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 280 }}>
            <thead>
              <tr style={{ background: COLORS.cream }}>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 12.5,
                      color: COLORS.ink,
                      textAlign: 'left',
                      padding: '9px 12px',
                      borderBottom: BORDER.thin,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} style={{ background: r % 2 === 0 ? W : COLORS.peach2 }}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 13,
                        color: c === 0 ? COLORS.ink : COLORS.ink60,
                        fontWeight: c === 0 ? 700 : 500,
                        padding: '8px 12px',
                        verticalAlign: 'top',
                        lineHeight: 1.4,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {block.note && (
          <div
            style={{
              padding: '10px 14px',
              borderTop: BORDER.hairline,
              fontFamily: FONTS.body,
              fontSize: 12.5,
              color: COLORS.ink60,
              lineHeight: 1.45,
            }}
          >
            {block.note}
          </div>
        )}
      </Sticker>
    )
  }

  if (block.kind === 'rule' || block.kind === 'tip' || block.kind === 'pitfall') {
    const style = CALLOUT_STYLE[block.kind] ?? CALLOUT_STYLE.rule
    return (
      <Sticker color={style.bg} radius={16} padding={14} style={{ marginBottom: 12 }}>
        {(block.title || style.label) && (
          <BlockTitle>
            {style.icon ? `${style.icon} ` : ''}
            {block.title ?? style.label}
          </BlockTitle>
        )}
        <RichText text={block.body} />
      </Sticker>
    )
  }

  return (
    <Sticker color={W} radius={16} padding={14} style={{ marginBottom: 12 }}>
      {block.title && <BlockTitle>{block.title}</BlockTitle>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {block.items.map((item, i) => (
          <SpeakRow key={i} pair={item} />
        ))}
      </div>
    </Sticker>
  )
}

export function SectionView({ section, index }: { section: CheatSection; index: number }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 99,
            background: COLORS.lav2,
            border: BORDER.thin,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 12,
            color: COLORS.ink,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <h2
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 18,
            color: COLORS.ink,
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          {section.heading}
        </h2>
      </div>
      {section.blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </section>
  )
}
