'use client'

import {
  MarkerInnerShapeIcons,
  MarkerInnerShapes,
  MarkerShapeIcons,
  MarkerShapes,
  PixelStyleIcons,
  PixelStyles,
} from '../src/lib/types'
import { OptionItem } from './OptionItem'
import { OptionSelectGroup } from './OptionSelectGroup'
import { QrCodeGeneratorMarkerState } from '../src/lib/types'

interface SettingsMarkerStyleProps {
  state: QrCodeGeneratorMarkerState
  number?: string
  nested?: boolean
}

export function SettingsMarkerStyle({ state, number, nested }: SettingsMarkerStyleProps) {
  const supportPixelStyle = [
    'square',
    'plus',
    'box',
    'random',
    'tiny-plus',
  ].includes(state.markerShape) || [
    'square',
    'plus',
  ].includes(state.markerInnerShape)

  return (
    <>
      <OptionItem title={[number, 'Pixel'].filter(Boolean).join(' ')} nested={nested}>
        {supportPixelStyle
          ? (
            <OptionSelectGroup
              value={state.markerStyle}
              onChange={v => (state.markerStyle = v as any)}
              options={PixelStyles}
              classes={PixelStyleIcons}
            />
            )
          : (
            <OptionSelectGroup
              value={state.markerStyle}
              onChange={v => (state.markerStyle = v as any)}
              options={['auto']}
            />
            )}
      </OptionItem>

      <OptionItem title={[number, 'Shape'].filter(Boolean).join(' ')} nested={nested}>
        <OptionSelectGroup
          value={state.markerShape}
          onChange={v => (state.markerShape = v as any)}
          options={MarkerShapes}
          classes={MarkerShapeIcons}
        />
      </OptionItem>

      <OptionItem title={[number, 'Inner'].filter(Boolean).join(' ')} nested={nested}>
        <OptionSelectGroup
          value={state.markerInnerShape}
          onChange={v => (state.markerInnerShape = v as any)}
          options={MarkerInnerShapes}
          classes={MarkerInnerShapeIcons}
        />
        <OptionSelectGroup
          value={state.markerInnerShape}
          onChange={v => (state.markerInnerShape = v as any)}
          options={['auto']}
        />
      </OptionItem>
    </>
  )
}
