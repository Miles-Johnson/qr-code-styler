'use client'

interface OptionColorProps {
  value: string
  onChange: (value: string) => void
}

export function OptionColor({ value, onChange }: OptionColorProps) {
  return (
    <div className="relative flex items-center gap-2 p-0.5 pr-1.5 border border-gray-200 rounded-lg bg-gray-100">
      <div className="w-4 h-4 border border-gray-200 rounded-full" style={{ background: value }} />
      <div className="text-sm font-mono">{value}</div>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 opacity-0"
      />
    </div>
  )
}
