'use client'

import { motion } from 'framer-motion'
import {
  Sticker,
  Tag,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
} from '@/components/design'
import type {
  Theory,
  TheorySection,
  TheoryTable,
  TheoryExample,
  TheoryCallout,
} from '@/types/lesson'

const W = '#fff' // @design-allow: white literal

type Props = {
  theory: Theory
  title: string
  onStartPhrases: () => void
}

export function TheoryView({ theory, title, onStartPhrases }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.lav,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${COLORS.lav2} 1px, transparent 0)`,
        backgroundSize: '14px 14px',
        paddingBottom: 120,
      }}
    >
      {/* Chapter header — peach gradient band */}
      <div
        style={{
          background: `linear-gradient(180deg, ${COLORS.peach2} 0%, ${COLORS.butter} 100%)`,
          borderBottom: BORDER.sticker,
          padding: '20px 20px 22px',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <Tag bg={COLORS.ink} color={COLORS.cream}>📖 chapter</Tag>
        </div>
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.ink,
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Chapter body */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 0' }}>
        <Paragraph text={theory.intro} emphasis />

        {theory.sections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}

        {theory.wrap_up && (
          <div style={{ marginTop: 28, marginBottom: 24 }}>
            <Sticker color={COLORS.cream} radius={18} padding={16}>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 11,
                  color: COLORS.orange,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                wrap up
              </div>
              <Paragraph text={theory.wrap_up} />
            </Sticker>
          </div>
        )}

        {/* CTA */}
        <motion.button
          onClick={onStartPhrases}
          whileTap={{ scale: 0.97 }}
          aria-label="Start phrases"
          style={{
            width: '100%',
            marginTop: 8,
            marginBottom: 24,
            padding: '18px',
            borderRadius: 22,
            background: COLORS.orange,
            color: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.sticker,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 17,
            cursor: 'pointer',
            letterSpacing: 0.2,
            textTransform: 'lowercase',
          }}
        >
          got it — try the phrases →
        </motion.button>
      </div>
    </div>
  )
}

function SectionBlock({ section }: { section: TheorySection }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 20,
          color: COLORS.ink,
          lineHeight: 1.25,
          margin: '0 0 10px',
        }}
      >
        {section.heading}
      </h2>
      <Paragraph text={section.body} />
      {section.table && <TableBlock table={section.table} />}
      {section.examples && section.examples.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.examples.map((ex, i) => (
            <ExampleBlock key={i} example={ex} />
          ))}
        </div>
      )}
      {section.callout && (
        <div style={{ marginTop: 14 }}>
          <CalloutBlock callout={section.callout} />
        </div>
      )}
    </section>
  )
}

function Paragraph({ text, emphasis = false }: { text: string; emphasis?: boolean }) {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0)
  return (
    <>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontFamily: FONTS.body,
            fontSize: emphasis ? 16 : 15,
            lineHeight: 1.55,
            color: emphasis ? COLORS.ink : COLORS.ink60,
            margin: i === 0 ? '0 0 12px' : '12px 0',
          }}
        >
          {p}
        </p>
      ))}
    </>
  )
}

function TableBlock({ table }: { table: TheoryTable }) {
  return (
    <div style={{ marginTop: 12 }}>
      {table.caption && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 12,
            fontStyle: 'italic',
            color: COLORS.ink45,
            marginBottom: 6,
          }}
        >
          {table.caption}
        </div>
      )}
      <Sticker color={W} radius={14} padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.cream, borderBottom: BORDER.thin }}>
              {table.columns.map((c, i) => (
                <th
                  key={i}
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 11,
                    color: COLORS.ink,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    padding: '8px 10px',
                    textAlign: 'left',
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? W : COLORS.peach2,
                  borderTop: ri === 0 ? 'none' : BORDER.hairline,
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 13,
                      color: COLORS.ink60,
                      padding: '8px 10px',
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
      </Sticker>
    </div>
  )
}

function ExampleBlock({ example }: { example: TheoryExample }) {
  return (
    <Sticker color={COLORS.butter} radius={14} padding={12}>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: 17,
          color: COLORS.ink,
          lineHeight: 1.3,
          marginBottom: 4,
        }}
      >
        {example.hindi}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 14,
          color: COLORS.ink60,
          lineHeight: 1.4,
        }}
      >
        {example.english}
      </div>
      {example.breakdown && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontStyle: 'italic',
            fontSize: 12,
            color: COLORS.ink45,
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          {example.breakdown}
        </div>
      )}
    </Sticker>
  )
}

function CalloutBlock({ callout }: { callout: TheoryCallout }) {
  // Lazy lookup at render time — module-load-time access to COLORS breaks tests
  // that mock the design barrel without re-exporting tokens.
  const config = {
    tip: { bg: COLORS.mint, emoji: '💡', label: 'tip' },
    note: { bg: COLORS.lav2, emoji: '📝', label: 'note' },
    warning: { bg: COLORS.peach, emoji: '⚠️', label: 'watch out' },
  }[callout.tone]
  return (
    <Sticker color={config.bg} radius={14} padding={12}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{config.emoji}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONTS.tag,
              fontSize: 10,
              color: COLORS.ink,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {config.label}
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 13,
              lineHeight: 1.5,
              color: COLORS.ink,
            }}
          >
            {callout.body}
          </div>
        </div>
      </div>
    </Sticker>
  )
}
