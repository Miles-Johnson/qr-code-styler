'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface OptionIconGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly T[]
  classes: readonly string[]
  titles?: readonly string[]
}

export function OptionIconGroup<T extends string>({
  value,
  onChange,
  options,
  classes,
  titles,
}: OptionIconGroupProps<T>) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => (
          <Tooltip key={option}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onChange(option)}
                className={`p-2 border rounded-lg ${
                  value === option ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                <div className={classes[i]} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{titles ? titles[i] : option}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
