'use client'

import { useState } from 'react'
import { OptionItem } from './OptionItem'
import { OptionSlider } from './OptionSlider'

interface SettingsRandomRangeProps {
  value: number | [number, number]
  onChange: (value: number | [number, number]) => void
  min: number
  max: number
  step: number
  title: string
  nested?: boolean | number
}

export function SettingsRandomRange({ value, onChange, min, max, step, title, nested }: SettingsRandomRangeProps) {
  const [showRange, setShowRange] = useState(typeof value !== 'number')

  const lower = typeof value === 'number' ? value : value[0]
  const upper = typeof value === 'number' ? value : value[1]

  function toggle() {
    if (typeof value === 'number') {
      onChange([
        Math.max(min, value - step * 10),
        Math.min(max, value + step * 10),
      ])
    }
    else {
      onChange((value[0] + value[1]) / 2)
    }
    setShowRange(!showRange)
  }

  const childNested = typeof nested === 'number' ? nested + 1 : nested ? 2 : 1

  return (
    <>
      {!showRange
        ? (
          <OptionItem title={title} nested={nested}>
            <OptionSlider value={lower} onChange={onChange as (v: number) => void} min={min} max={max} step={step} />
            <button
              className="p-1 text-xs border border-gray-200 rounded-lg"
              title="Expand to use random"
              onClick={toggle}
            >
              <div className="i-ri-arrow-down-s-line" />
            </button>
          </OptionItem>
          )
        : (
          <>
            <OptionItem title={title} nested={nested}>
              <div className="flex-auto" />
              <button
                className="p-1 text-xs border border-gray-200 rounded-lg"
                onClick={toggle}
              >
                <div className="i-ri-arrow-up-s-line" />
              </button>
            </OptionItem>
            <OptionItem title="Min" nested={childNested}>
              <OptionSlider value={lower} onChange={v => onChange([v, upper])} min={min} max={upper} step={step} />
            </OptionItem>
            <OptionItem title="Max" nested={childNested}>
              <OptionSlider value={upper} onChange={v => onChange([lower, v])} min={lower} max={max} step={step} />
            </OptionItem>
          </>
          )}
    </>
  )
}
