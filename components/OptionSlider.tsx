'use client'

import { Slider } from './ui/slider'

interface OptionSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit?: string
  defaultValue?: number
}

export function OptionSlider({ value, onChange, min, max, step, unit, defaultValue }: OptionSliderProps) {
  return (
    <div className="flex items-center gap-2">
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      <div className="relative h-10">
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-24 p-2 pr-8 border border-gray-300 rounded-lg"
        />
        {unit && <span className="absolute right-2 top-2 text-gray-400">{unit}</span>}
      </div>
    </div>
  )
}
