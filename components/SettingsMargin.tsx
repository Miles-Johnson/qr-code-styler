'use client'

import { useState } from 'react'
import type { MarginObject } from '../src/lib/types'
import { resolveMargin } from '../src/lib/utils'
import { OptionItem } from './OptionItem'
import { OptionSlider } from './OptionSlider'

interface SettingsMarginProps {
  value: number | MarginObject
  onChange: (value: number | MarginObject) => void
  fullCustomizable?: boolean
}

export function SettingsMargin({ value, onChange, fullCustomizable }: SettingsMarginProps) {
  const [showFull, setShowFull] = useState(
    typeof value === 'number'
      ? false
      : value.top !== value.bottom
        || value.left !== value.right,
  )

  const x = typeof value === 'number' ? value : value.left
  const y = typeof value === 'number' ? value : value.top

  function handleXChange(v: number) {
    if (typeof value === 'number') {
      onChange(v)
      return
    }
    onChange({ ...value, left: v, right: v })
  }

  function handleYChange(v: number) {
    if (typeof value === 'number') {
      onChange(v)
      return
    }
    onChange({ ...value, top: v, bottom: v })
  }

  function toggleFull() {
    setShowFull(!showFull)
    if (!showFull && typeof value !== 'number')
      onChange({ ...value, left: value.right, top: value.bottom })
  }

  return (
    <>
      {typeof value === 'number'
        ? (
          <OptionItem title="Margin" onReset={() => onChange(2)}>
            <OptionSlider value={value} onChange={onChange} min={0} max={20} step={1} />
            <button
              className="p-1 text-xs border border-gray-200 rounded-lg"
              onClick={() => onChange(resolveMargin(value))}
            >
              <div className="i-ri-arrow-down-s-line" />
            </button>
          </OptionItem>
          )
        : (
          <>
            <OptionItem title="Margin" onReset={() => onChange({ top: 2, left: 2, right: 2, bottom: 2 })}>
              <div className="flex-auto" />
              {fullCustomizable && (
                <button
                  className="p-1 text-xs border border-gray-200 rounded-lg"
                  onClick={toggleFull}
                >
                  <div className="i-ri-drag-move-line" />
                </button>
              )}
              <button
                className="p-1 text-xs border border-gray-200 rounded-lg"
                onClick={() => onChange(value.top)}
              >
                <div className="i-ri-arrow-up-s-line" />
              </button>
            </OptionItem>

            {showFull && fullCustomizable
              ? (
                <>
                  <OptionItem title="Left" nested>
                    <OptionSlider value={value.left} onChange={v => onChange({ ...value, left: v })} min={0} max={20} step={1} />
                  </OptionItem>
                  <OptionItem title="Right" nested>
                    <OptionSlider value={value.right} onChange={v => onChange({ ...value, right: v })} min={0} max={20} step={1} />
                  </OptionItem>
                  <OptionItem title="Top" nested>
                    <OptionSlider value={value.top} onChange={v => onChange({ ...value, top: v })} min={0} max={20} step={1} />
                  </OptionItem>
                  <OptionItem title="Bottom" nested>
                    <OptionSlider value={value.bottom} onChange={v => onChange({ ...value, bottom: v })} min={0} max={20} step={1} />
                  </OptionItem>
                </>
                )
              : (
                <>
                  <OptionItem title="X" nested>
                    <OptionSlider value={x} onChange={handleXChange} min={0} max={20} step={1} />
                  </OptionItem>
                  <OptionItem title="Y" nested>
                    <OptionSlider value={y} onChange={handleYChange} min={0} max={20} step={1} />
                  </OptionItem>
                </>
                )}
          </>
          )}
    </>
  )
}
