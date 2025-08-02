'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface OptionItemProps {
  title: string
  nested?: boolean | number
  div?: boolean
  description?: string
  onReset?: () => void
  children: React.ReactNode
}

export function OptionItem({ title, nested, div, description, onReset, children }: OptionItemProps) {
  const Component = div ? 'div' : 'label'

  return (
    <Component className="flex flex-row items-center gap-2 select-none">
      <div className="w-36 flex items-center gap-1">
        {nested && (
          <div
            className="i-ri-corner-down-right-line opacity-40"
            style={{ marginLeft: typeof nested === 'number' ? `${nested * 0.5 + 0.5}rem` : '0.25rem' }}
          />
        )}
        {!description && (
          <div className="text-sm opacity-75" onDoubleClick={onReset}>
            {title}
          </div>
        )}
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm opacity-75" onDoubleClick={onReset}>
                  {title}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
    </Component>
  )
}
