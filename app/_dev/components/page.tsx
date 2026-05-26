'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'
import {
  Sticker,
  Tag,
  HeaderBand,
  Cutting,
  MotifIcon,
  MarigoldStrip,
  StreakChip,
  DottedBg,
  SpeechBubble,
  LessonStickerCard,
  COLORS,
  FONTS,
  RADIUS,
  SHADOW,
  BORDER,
} from '@/components/design'
import type { CuttingMood, MotifKind } from '@/components/design'
import type { Lesson } from '@/types/lesson'

const W = '#fff' // @design-allow: white literal

const MOODS: CuttingMood[] = ['idle', 'happy', 'wave', 'sympathy', 'wink', 'excited', 'sleepy']
const MOTIFS: MotifKind[] = ['marigold', 'auto', 'chai', 'film', 'phone', 'map']

const SAMPLE_LESSON: Lesson = {
  id: 'sample',
  title: 'Sample Lesson',
  situation: 'Sample situation',
  skills: ['skill one', 'skill two'],
  phrases: [],
  grammar_notes: [],
  culture_notes: [],
  skill_breakdown: [],
  practice_prompt: 'Sample',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <details id={id} style={{ marginBottom: 16 }}>
      <summary
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 18,
          color: COLORS.ink,
          textTransform: 'lowercase',
          padding: '8px 0',
          cursor: 'pointer',
        }}
      >
        {title}
      </summary>
      <div style={{ padding: '10px 0 18px' }}>{children}</div>
    </details>
  )
}

export default function GalleryPage() {
  const [fireConfetti, setFireConfetti] = useState(0)

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav }}>
      <DottedBg />
      <main
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
          padding: '40px 16px 80px',
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.ink,
            textTransform: 'lowercase',
            margin: 0,
          }}
        >
          chai galli — component gallery
        </h1>
        <p
          style={{
            fontFamily: FONTS.body,
            color: COLORS.ink60,
            fontSize: 14,
            marginTop: 6,
          }}
        >
          rules: see <code>/DESIGN.md</code>.
        </p>

        <Section id="palette" title="palette">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {(Object.entries(COLORS) as [string, string][]).map(([name, hex]) => (
              <div key={name} style={{ textAlign: 'center', fontFamily: FONTS.body, fontSize: 11 }}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: hex,
                    border: BORDER.thin,
                    borderRadius: RADIUS.sm,
                  }}
                />
                <div style={{ marginTop: 4, color: COLORS.ink, fontWeight: 700 }}>{name}</div>
                <div style={{ color: COLORS.ink60 }}>{hex}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="fonts" title="fonts">
          {(Object.entries(FONTS) as [string, string][]).map(([role, family]) => (
            <div key={role} style={{ marginBottom: 10, padding: 12, background: W, border: BORDER.sticker, borderRadius: RADIUS.md, boxShadow: SHADOW.sticker }}>
              <div style={{ fontFamily: FONTS.tag, fontSize: 11, color: COLORS.ink60 }}>{role.toUpperCase()}</div>
              <div style={{ fontFamily: family, fontSize: 18, color: COLORS.ink, marginTop: 4 }}>
                The quick brown fox — namaste dost
              </div>
            </div>
          ))}
        </Section>

        <Section id="sticker" title="Sticker">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Sticker>default sticker</Sticker>
            <Sticker color={COLORS.peach}>peach sticker</Sticker>
            <Sticker color={COLORS.mint}>mint sticker</Sticker>
            <Sticker color={COLORS.butter}>butter sticker</Sticker>
            <Sticker dashed>dashed sticker (hint state)</Sticker>
            <Sticker selected>selected (lifted)</Sticker>
            <Sticker onClick={() => {}}>clickable</Sticker>
          </div>
        </Section>

        <Section id="tag" title="Tag">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Tag>default</Tag>
            <Tag bg={COLORS.orange} color={COLORS.cream}>orange</Tag>
            <Tag bg={COLORS.mint} color={COLORS.ink}>mint</Tag>
            <Tag bg={COLORS.butter}>butter</Tag>
            <Tag bg={COLORS.lav2}>lavender</Tag>
          </div>
        </Section>

        <Section id="header-band" title="HeaderBand">
          <HeaderBand tag="example" title="header band sample" />
        </Section>

        <Section id="cutting" title="Cutting (all 7 moods)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {MOODS.map((mood) => (
              <div key={mood} style={{ textAlign: 'center', fontFamily: FONTS.tag, fontSize: 10, color: COLORS.ink60 }}>
                <Cutting size={68} mood={mood} blink={false} />
                <div style={{ marginTop: 4 }}>{mood.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Cutting size={170} mood="happy" blink={false} />
            <div style={{ fontFamily: FONTS.tag, fontSize: 10, color: COLORS.ink60, textAlign: 'center' }}>HAPPY @ 170 (celebration scale)</div>
          </div>
        </Section>

        <Section id="motif-icon" title="MotifIcon (all 6 kinds)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {MOTIFS.map((kind) => (
              <div key={kind} style={{ textAlign: 'center', fontFamily: FONTS.tag, fontSize: 10, color: COLORS.ink60 }}>
                <MotifIcon kind={kind} size={64} />
                <div style={{ marginTop: 4 }}>{kind.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="marigold-strip" title="MarigoldStrip">
          <MarigoldStrip />
        </Section>

        <Section id="streak-chip" title="StreakChip">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1, 7, 14, 30, 100].map((n) => <StreakChip key={n} count={n} />)}
          </div>
        </Section>

        <Section id="confetti" title="Confetti">
          <button
            onClick={() => {
              setFireConfetti((n) => n + 1)
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } })
            }}
            style={{
              padding: '12px 16px',
              background: COLORS.orange,
              color: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.sticker,
              borderRadius: RADIUS.md,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              textTransform: 'lowercase',
              cursor: 'pointer',
            }}
          >
            fire confetti
          </button>
          <span style={{ marginLeft: 10, fontFamily: FONTS.body, color: COLORS.ink60, fontSize: 12 }}>
            fired {fireConfetti} time{fireConfetti === 1 ? '' : 's'}
          </span>
        </Section>

        <Section id="dotted-bg" title="DottedBg">
          <div style={{ position: 'relative', height: 80, background: COLORS.lav, border: BORDER.sticker, borderRadius: RADIUS.md, overflow: 'hidden' }}>
            <DottedBg opacity={0.7} />
            <div style={{ position: 'relative', padding: 10, fontFamily: FONTS.body, color: COLORS.ink, zIndex: 1 }}>opacity 0.7 sample</div>
          </div>
        </Section>

        <Section id="speech-bubble" title="SpeechBubble">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingLeft: 20 }}>
            <SpeechBubble tail="bottom-right">default bottom-right</SpeechBubble>
            <SpeechBubble tail="bottom-left" caption="with caption">bottom-left + caption</SpeechBubble>
            <SpeechBubble tail="top-right">top-right tail</SpeechBubble>
            <SpeechBubble tail="top-left">top-left tail</SpeechBubble>
          </div>
        </Section>

        <Section id="lesson-sticker-card" title="LessonStickerCard">
          <LessonStickerCard lesson={SAMPLE_LESSON} index={0} routeBase="lessons" locked={false} />
          <div style={{ marginTop: 10 }}>
            <LessonStickerCard lesson={SAMPLE_LESSON} index={1} routeBase="lessons" locked={true} />
          </div>
        </Section>

        <Section id="buttons" title="Buttons">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'primary (orange)', bg: COLORS.orange, fg: W },
              { label: 'secondary (cream)', bg: COLORS.cream, fg: COLORS.ink },
              { label: 'success (green)', bg: COLORS.green, fg: W },
              { label: 'danger (red)', bg: COLORS.red, fg: W },
            ].map(({ label, bg, fg }) => (
              <button
                key={label}
                style={{
                  padding: '12px 16px',
                  background: bg,
                  color: fg,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.sticker,
                  borderRadius: RADIUS.md,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 14,
                  textTransform: 'lowercase',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>
      </main>
    </div>
  )
}
