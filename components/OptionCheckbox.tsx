'use client'

import { Checkbox } from './ui/checkbox'

interface OptionCheckboxProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function OptionCheckbox({ value, onChange }: OptionCheckboxProps) {
  return (
    <div className="flex items-center h-5 w-5 p-0.5">
      <Checkbox checked={value} onCheckedChange={onChange} />
    </div>
  )
}
