'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Cutting } from './Cutting'
import { SpeechBubble } from './SpeechBubble'
import { MOMENTS, pickLine, type Moment, type Line } from './moments'
import { chainaVoice } from '@/lib/chaina-voice'

type ActiveState = {
  key: string
  line: Line
  idx: number
  phase: 'enter' | 'hold' | 'exit'
}

interface ChainaAPI {
  play: (key: string) => void
  stop: () => void
}

const Ctx = createContext<ChainaAPI | null>(null)

export function ChainaProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveState | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const play = useCallback((key: string) => {
    const cfg = MOMENTS[key]
    if (!cfg) return
    clearTimers()
    const { line, idx } = pickLine(key)
    setActive({ key, line, idx, phase: 'enter' })

    if (cfg.voice && line.speak) {
      timersRef.current.push(
        setTimeout(() => chainaVoice.play(key, idx, line.speak), 200)
      )
    }

    timersRef.current.push(
      setTimeout(() => {
        setActive(s => (s && s.key === key ? { ...s, phase: 'hold' } : s))
      }, cfg.enterMs)
    )
    timersRef.current.push(
      setTimeout(() => {
        setActive(s => (s && s.key === key ? { ...s, phase: 'exit' } : s))
      }, cfg.enterMs + cfg.holdMs)
    )
    timersRef.current.push(
      setTimeout(() => {
        setActive(s => (s && s.key === key ? null : s))
      }, cfg.enterMs + cfg.holdMs + cfg.exitMs)
    )
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    setActive(null)
    chainaVoice.cancel()
  }, [])

  return (
    <Ctx.Provider value={{ play, stop }}>
      {children}
      <MomentStage active={active} onTap={() => play('tap')} />
    </Ctx.Provider>
  )
}

export function useChaina(): ChainaAPI {
  const ctx = useContext(Ctx)
  if (!ctx) return { play: () => {}, stop: () => {} }
  return ctx
}

function MomentStage({ active, onTap }: { active: ActiveState | null; onTap: () => void }) {
  if (!active) return null
  const cfg = MOMENTS[active.key]
  return (
    <div
      data-chaina-moment
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 45,
        pointerEvents: 'none',
      }}
    >
      <MomentRender cfg={cfg} line={active.line} phase={active.phase} onTap={onTap} />
    </div>
  )
}

function anchorStyle(cfg: Moment, cuttingSize: number): React.CSSProperties {
  switch (cfg.anchor) {
    case 'bottom-right': return { right: 12, bottom: 16, position: 'absolute' }
    case 'bottom-left':  return { left: 12, bottom: 16, position: 'absolute' }
    case 'top-right':    return { right: 12, top: 60, position: 'absolute' }
    case 'top-left':     return { left: 12, top: 60, position: 'absolute' }
    case 'center':       return { inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute' }
    case 'bottom-edge':  return { right: 24, bottom: -cuttingSize * 0.55, position: 'absolute' }
    case 'walk':         return { left: 0, bottom: 16, position: 'absolute' }
    case 'inline-right': return { right: 24, top: 240, position: 'absolute' }
    case 'inplace':      return { right: 18, bottom: 18, position: 'absolute' }
    default:             return { right: 12, bottom: 16, position: 'absolute' }
  }
}

function MomentRender({
  cfg,
  line,
  phase,
  onTap,
}: {
  cfg: Moment
  line: Line
  phase: 'enter' | 'hold' | 'exit'
  onTap: () => void
}) {
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 390
  const cuttingSize = Math.round(Math.min(viewportW, 480) * cfg.sizePct)
  const animByPhase: Record<typeof phase, string> = {
    enter: `${cfg.enter} ${cfg.enterMs}ms cubic-bezier(.34,1.56,.64,1) forwards`,
    hold: cfg.moodAnim || 'none',
    exit: `${cfg.exit} ${cfg.exitMs}ms ease-in forwards`,
  }
  const aStyle = anchorStyle(cfg, cuttingSize)
  const walkAnchor = cfg.anchor === 'walk'
  const bubblePos: React.CSSProperties = cfg.bubbleSide === 'left'
    ? { right: cuttingSize + 8, bottom: cuttingSize * 0.55, position: 'absolute' }
    : { left: cuttingSize + 8, bottom: cuttingSize * 0.55, position: 'absolute' }

  // For center anchor, the mascot's enter/exit animations override transform-based
  // centering. Use a flex wrapper that doesn't get the animation applied.
  const useFlexCenter = cfg.anchor === 'center'
  const mascotOuter: React.CSSProperties = useFlexCenter
    ? { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }
    : aStyle
  const mascotInner: React.CSSProperties = useFlexCenter
    ? { width: cuttingSize, animation: animByPhase[phase], cursor: 'pointer', pointerEvents: 'auto' }
    : { ...aStyle, width: cuttingSize, animation: animByPhase[phase], cursor: 'pointer', pointerEvents: 'auto' }

  // Bubble wrapper uses the original aStyle (which for center anchor still uses
  // transform-translate; that's fine because the bubble's only animation is
  // bubble-pop, which animates scale/opacity, not translate).
  const bubbleWrapperStyle: React.CSSProperties = useFlexCenter
    ? { left: '50%', top: '40%', transform: 'translate(-50%, -50%)', position: 'absolute', pointerEvents: 'none' }
    : { ...aStyle, pointerEvents: 'none' }

  return (
    <>
      {phase !== 'exit' && !walkAnchor && (
        <div style={bubbleWrapperStyle}>
          <div
            data-testid="chaina-bubble"
            style={{
              ...bubblePos,
              pointerEvents: 'none',
              animation: `bubble-pop ${Math.max(cfg.enterMs - 100, 240)}ms cubic-bezier(.34,1.56,.64,1) ${Math.max(cfg.enterMs - 280, 80)}ms backwards`,
            }}
          >
            <SpeechBubble tail={cfg.bubbleTail} caption={line.caption}>
              {line.main}
            </SpeechBubble>
          </div>
        </div>
      )}
      {useFlexCenter ? (
        <div style={mascotOuter}>
          <div onClick={onTap} style={mascotInner}>
            <div
              style={{
                width: '100%',
                height: '100%',
                animation: phase === 'hold' ? animByPhase.hold : 'none',
                transformOrigin: 'center bottom',
              }}
            >
              <Cutting size={cuttingSize} mood={cfg.mood} blink={cfg.mood !== 'sleepy'} />
            </div>
          </div>
        </div>
      ) : (
        <div onClick={onTap} style={mascotInner}>
          <div
            style={{
              width: '100%',
              height: '100%',
              animation: phase === 'hold' ? animByPhase.hold : 'none',
              transformOrigin: 'center bottom',
            }}
          >
            <Cutting size={cuttingSize} mood={cfg.mood} blink={cfg.mood !== 'sleepy'} />
          </div>
          {walkAnchor && phase !== 'exit' && (
            <div
              data-testid="chaina-bubble"
              style={{
                position: 'absolute',
                left: cuttingSize - 18,
                bottom: cuttingSize * 0.5,
                animation: 'bubble-pop 360ms cubic-bezier(.34,1.56,.64,1) 200ms backwards',
              }}
            >
              <SpeechBubble tail="bottom-left" caption={line.caption}>
                {line.main}
              </SpeechBubble>
            </div>
          )}
        </div>
      )}
    </>
  )
}
