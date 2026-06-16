'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import {
  Sticker,
  Tag,
  DottedBg,
  DoneFold,
  MotifIcon,
  COLORS,
  FONTS,
  BORDER,
  useTheme,
} from '@/components/design'
import { getAllStories } from '@/lib/stories'
import { getStoriesReadCount, getStoriesRead } from '@/lib/stories-progress'
import { StoryCard } from '@/components/stories/StoryCard'
import { getCourseProgress as getHindiSoundsCourseProgress } from '@/lib/hindi/pronunciation'
import { getCourseProgress as getDutchSoundsCourseProgress } from '@/lib/dutch/pronunciation'

const W = '#fff' // @design-allow: white literal

export default function LearnPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const theme = useTheme()

  const stories = useMemo(() => (language === 'hindi' ? getAllStories() : []), [language])
  const [storiesReadCount, setStoriesReadCount] = useState(0)
  const [readStoryIds, setReadStoryIds] = useState<Set<string>>(new Set())
  const [soundsDone, setSoundsDone] = useState(0)
  const [soundsTotal, setSoundsTotal] = useState(language === 'dutch' ? 8 : 6)

  useEffect(() => {
    if (language === 'hindi') {
      setStoriesReadCount(getStoriesReadCount())
      setReadStoryIds(new Set(getStoriesRead()))
    }
    const p = language === 'dutch' ? getDutchSoundsCourseProgress() : getHindiSoundsCourseProgress()
    setSoundsDone(p.completed)
    setSoundsTotal(p.total)
  }, [language])

  const soundsRoute = language === 'dutch' ? '/dutch/sounds' : '/sounds'
  const soundsSubtitle = language === 'dutch' ? 'uitspraak · letters, words, flow' : 'uchchaaran · vowels, sounds, words'

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 110 }}>
      <DottedBg />

      {/* HEADER BAND */}
      <div
        style={{
          position: 'relative',
          padding: '50px 20px 22px',
          background: `linear-gradient(160deg, ${theme.bandFrom}, ${theme.bandTo})`,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          borderBottom: BORDER.sticker,
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <Tag>✦ explore</Tag>
          <h1
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 30,
              color: COLORS.ink,
              letterSpacing: -0.6,
              marginTop: 8,
            }}
          >
            Learn
          </h1>
          <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink60, marginTop: 2 }}>
            words, sounds{language === 'hindi' ? ', and stories' : ''} to build on your lessons
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '18px 20px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {/* VOCABULARY */}
        <Sticker color={COLORS.mint2} radius={18} padding={14} onClick={() => { playSound('pop'); router.push('/vocabulary') }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, background: COLORS.teal, borderRadius: 14, border: BORDER.thin, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ transform: 'scale(0.6)' }}><MotifIcon kind="chai" size={64} /></div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: COLORS.ink }}>Vocabulary</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink60, marginTop: 2 }}>
                swipe word cards by topic
              </div>
            </div>
            <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: COLORS.ink }}>→</span>
          </div>
        </Sticker>

        {/* SOUNDS */}
        <Sticker color={theme.primary} radius={18} padding={14} onClick={() => { playSound('pop'); router.push(soundsRoute) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 30 }}>🔊</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: W }}>
                Sounds: speak from zero
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: W, opacity: 0.92, marginTop: 2 }}>
                <em>{soundsSubtitle.split(' · ')[0]}</em> · {soundsSubtitle.split(' · ')[1]} · {soundsDone}/{soundsTotal} stages
              </div>
            </div>
            <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: W }}>→</span>
          </div>
        </Sticker>

        {/* STORIES (Hindi only) */}
        {language === 'hindi' && stories.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 1 }}>
                Stories
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 11, color: COLORS.ink60, background: COLORS.cream, border: BORDER.thin, padding: '2px 10px', borderRadius: 999 }}>
                {storiesReadCount} of {stories.length} read
              </div>
            </div>
            {(() => {
              const indexed = stories.map((s, i) => ({ s, i }))
              const unread = indexed.filter(({ s }) => !readStoryIds.has(s.id))
              const read = indexed.filter(({ s }) => readStoryIds.has(s.id))
              return (
                <>
                  {unread.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {unread.map(({ s, i }) => (
                        <StoryCard key={s.id} story={s} index={i} />
                      ))}
                    </div>
                  )}
                  {read.length > 0 && (
                    <DoneFold
                      count={read.length}
                      noun="read"
                      gap={12}
                      storageKey="learn-hindi:hindi-stories-fold"
                      style={{ marginTop: unread.length > 0 ? 12 : 0 }}
                    >
                      {read.map(({ s, i }) => (
                        <StoryCard key={s.id} story={s} index={i} />
                      ))}
                    </DoneFold>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
