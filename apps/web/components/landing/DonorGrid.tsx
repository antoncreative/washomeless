'use client'

import { useEffect, useRef, useState } from 'react'

// 100 dots that fill in one-by-one — each dot is one $30/month donor.
export default function DonorGrid({ filled = 87, name = 'Marcus T.' }: { filled?: number; name?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setInterval> | undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      timer = setInterval(() => {
        setCount((c) => {
          if (c >= filled) {
            clearInterval(timer)
            return c
          }
          return c + 1
        })
      }, 25)
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (timer) clearInterval(timer)
    }
  }, [filled])

  return (
    <div ref={ref} className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center font-bold text-emerald-950">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white leading-tight">{name}</p>
            <p className="text-xs text-emerald-100/80">Example · Toronto</p>
          </div>
        </div>
        <span className="text-xs font-medium rounded-full bg-emerald-400/20 text-emerald-100 px-3 py-1">
          {100 - count} spots left
        </span>
      </div>

      <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
        {Array.from({ length: 100 }, (_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full transition-colors duration-300 ${
              i < count ? 'bg-emerald-300 animate-pop' : 'bg-white/15'
            }`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white tabular-nums">{count}<span className="text-emerald-200/70 text-lg">/100</span></p>
          <p className="text-xs text-emerald-100/80">donors at $30/month</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-white tabular-nums">${(count * 30).toLocaleString()}</p>
          <p className="text-xs text-emerald-100/80">of $3,000/month</p>
        </div>
      </div>
    </div>
  )
}
