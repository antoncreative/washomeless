'use client'

import { useState } from 'react'

// Lets visitors see what their circle of friends could fund together.
export default function ImpactCalculator() {
  const [donors, setDonors] = useState(100)
  const monthly = donors * 30
  const people = Math.floor(donors / 100)
  const towardNext = donors % 100

  return (
    <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm">
      <label htmlFor="donors" className="block text-sm font-medium text-gray-600 mb-2">
        If this many people gave $30/month…
      </label>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-5xl font-bold text-gray-900 tabular-nums">{donors}</span>
        <span className="text-gray-500">donors</span>
      </div>
      <input
        id="donors"
        type="range"
        min={10}
        max={1000}
        step={10}
        value={donors}
        onChange={(e) => setDonors(Number(e.target.value))}
        className="w-full accent-emerald-600 h-2 cursor-pointer"
      />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">${monthly.toLocaleString()}</p>
          <p className="text-xs sm:text-sm text-emerald-900/70">raised every month</p>
        </div>
        <div className="rounded-2xl bg-teal-50 p-4">
          <p className="text-2xl sm:text-3xl font-bold text-teal-700 tabular-nums">{people}</p>
          <p className="text-xs sm:text-sm text-teal-900/70">
            {people === 1 ? 'person fully funded' : 'people fully funded'}
          </p>
        </div>
      </div>
      {towardNext > 0 ? (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Next person</span>
            <span>{towardNext}% there</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${towardNext}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
