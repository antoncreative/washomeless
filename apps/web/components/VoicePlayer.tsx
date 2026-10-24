'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, Mic } from 'lucide-react'

const BARS = 48
const RATES = [1, 1.5, 2]

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// A stable, natural-looking waveform per recording — same shape as in the iOS app.
function waveform(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return Array.from({ length: BARS }, (_, i) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
    const noise = (h % 1000) / 1000
    const envelope = Math.sin((Math.PI * (i + 1)) / (BARS + 1))
    return 0.18 + 0.82 * (0.35 * envelope + 0.65 * noise * (0.4 + 0.6 * envelope))
  })
}

export default function VoicePlayer({ src, seed }: { src: string; seed?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const bars = useMemo(() => waveform(seed ?? src), [seed, src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let frame = 0
    // Smooth progress while playing (timeupdate alone only fires ~4×/second).
    const tick = () => {
      setCurrent(audio.currentTime)
      frame = requestAnimationFrame(tick)
    }
    const onPlay = () => {
      setPlaying(true)
      frame = requestAnimationFrame(tick)
    }
    const onPause = () => {
      setPlaying(false)
      cancelAnimationFrame(frame)
      setCurrent(audio.currentTime)
    }
    const onEnded = () => {
      audio.currentTime = 0
      setCurrent(0)
    }
    // Some browsers report Infinity for freshly recorded files until they've been scanned.
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    }
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    return () => {
      cancelAnimationFrame(frame)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  function seekFromPointer(clientX: number) {
    const audio = audioRef.current
    const wave = waveRef.current
    if (!audio || !wave || !duration) return
    const rect = wave.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * duration
    setCurrent(audio.currentTime)
  }

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    setRate(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const progress = duration > 0 ? Math.min(1, current / duration) : 0
  const started = playing || current > 0.05

  return (
    <div className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-3 sm:p-4 text-white shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause voice note' : 'Play voice note'}
        className="relative h-12 w-12 shrink-0 rounded-full bg-white text-teal-700 shadow-md transition-transform active:scale-95 hover:scale-105"
      >
        {playing && <span className="absolute inset-0 rounded-full bg-white/70 animate-ping" />}
        <span className="relative flex h-full w-full items-center justify-center">
          {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </span>
      </button>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div
          ref={waveRef}
          className="flex h-9 items-center gap-[2px] cursor-pointer select-none touch-none"
          onPointerDown={(e) => {
            draggingRef.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            seekFromPointer(e.clientX)
          }}
          onPointerMove={(e) => draggingRef.current && seekFromPointer(e.clientX)}
          onPointerUp={() => (draggingRef.current = false)}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
        >
          {bars.map((h, i) => (
            <span
              key={i}
              className={`flex-1 rounded-full transition-colors duration-150 ${(i + 0.5) / BARS <= progress ? 'bg-white' : 'bg-white/35'}`}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-semibold tabular-nums">
            {started ? `${fmt(current)} / ${fmt(duration)}` : duration ? fmt(duration) : '0:00'}
          </span>
          <span className="flex items-center gap-1 text-white/80 font-medium">
            <Mic className="h-3 w-3" /> Voice note
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={cycleRate}
        className="shrink-0 min-w-[2.75rem] rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold hover:bg-white/30"
        aria-label="Playback speed"
      >
        {rate}×
      </button>
    </div>
  )
}
