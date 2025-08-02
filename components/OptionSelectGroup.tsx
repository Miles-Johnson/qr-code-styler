'use client'

import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'

interface OptionSelectGroupProps {
  value: string | number
  onChange: (value: string | number) => void
  options: readonly (string | number)[]
  titles?: string[]
  classes?: string[]
}

export function OptionSelectGroup({ value, onChange, options, titles, classes }: OptionSelectGroupProps) {
  return (
    <RadioGroup value={String(value)} onValueChange={onChange} className="flex flex-wrap border border-gray-200 rounded-lg overflow-hidden text-xs">
      {options.map((option, idx) => (
        <Label
          key={option}
          className={`
            relative p-2 hover:bg-gray-100
            ${String(option) === String(value) ? 'bg-gray-200' : ''}
            ${idx ? 'border-l border-gray-200' : ''}
          `}
          title={titles?.[idx]}
        >
          <RadioGroupItem value={String(option)} className="sr-only" />
          <div
            className={`
              ${String(option) === String(value) ? '' : 'opacity-35'}
              ${titles?.[idx] ? '' : 'capitalize'}
              ${classes?.[idx] || ''}
            `}
          >
            {titles?.[idx] ?? option}
          </div>
        </Label>
      ))}
    </RadioGroup>
  )
}
