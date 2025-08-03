'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { generateQRCode } from '../src/lib/generate'
import { generatorState } from '../src/lib/store'
import { PixelStyleIcons, PixelStyles } from '../src/lib/types'
import { OptionSelectGroup } from './OptionSelectGroup'
import { OptionCheckbox } from './OptionCheckbox'
import { MarkerSubShapeIcons, MarkerSubShapes } from '../src/lib/types'
import { OptionSlider } from './OptionSlider'
import { OptionColor } from './OptionColor'
import { ImageUpload } from './ImageUpload'

export const AdvancedQrGenerator = forwardRef((props, ref) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const state = useSnapshot(generatorState)

  useImperativeHandle(ref, () => canvas.current)

  useEffect(() => {
    if (canvas.current && state.text)
      generateQRCode(canvas.current, JSON.parse(JSON.stringify(state)))
  }, [state])

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <h1 className="text-lg font-semibold">QR Code Generator</h1>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Controls Panel - More compact */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Text Input */}
            <div>
              <label className="block text-xs font-medium mb-1">Text to encode:</label>
              <textarea
                value={state.text}
                onChange={e => (generatorState.text = e.target.value)}
                placeholder="Enter text or URL"
                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Error Correction */}
            <div>
              <label className="block text-xs font-medium mb-1">Error Correction</label>
              <div className="flex items-center gap-2">
                <OptionSelectGroup
                  value={state.ecc}
                  onChange={v => (generatorState.ecc = v as 'L' | 'M' | 'Q' | 'H')}
                  options={['L', 'M', 'Q', 'H']}
                />
                <label className="flex items-center gap-1 text-xs">
                  <OptionCheckbox
                    value={state.boostECC}
                    onChange={v => (generatorState.boostECC = v)}
                  />
                  Boost ECC
                </label>
              </div>
            </div>

            {/* Mask Pattern */}
            <div>
              <label className="block text-xs font-medium mb-1">Mask Pattern</label>
              <OptionSelectGroup
                value={state.maskPattern}
                onChange={v => (generatorState.maskPattern = v as number)}
                options={[-1, 0, 1, 2, 3, 4, 5, 6, 7]}
                titles={['Auto', '0', '1', '2', '3', '4', '5', '6', '7']}
              />
            </div>

            {/* Rotate */}
            <div>
              <label className="block text-xs font-medium mb-1">Rotate</label>
              <OptionSelectGroup
                value={state.rotate}
                onChange={v => (generatorState.rotate = v as 0 | 90 | 180 | 270)}
                options={[0, 90, 180, 270]}
                titles={['0°', '90°', '180°', '270°']}
              />
            </div>

            {/* Pixel Style */}
            <div>
              <label className="block text-xs font-medium mb-1">Pixel Style</label>
              <OptionSelectGroup
                value={state.pixelStyle}
                onChange={v => (generatorState.pixelStyle = v as any)}
                options={PixelStyles}
                classes={PixelStyleIcons}
              />
            </div>

            {/* Markers */}
            <div>
              <label className="block text-xs font-medium mb-1">Markers</label>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-600">Shape:</span>
                  <OptionSelectGroup
                    value={state.markerShape}
                    onChange={v => (generatorState.markerShape = v as any)}
                    options={['square', 'rounded']}
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-600">Inner:</span>
                  <OptionSelectGroup
                    value={state.markerInnerShape}
                    onChange={v => (generatorState.markerInnerShape = v as any)}
                    options={['square', 'circle', 'plus', 'diamond']}
                  />
                </div>
              </div>
            </div>

            {/* Sub Markers */}
            <div>
              <label className="block text-xs font-medium mb-1">Sub Markers</label>
              <OptionSelectGroup
                value={state.markerSub}
                onChange={v => (generatorState.markerSub = v as any)}
                options={MarkerSubShapes}
                classes={MarkerSubShapeIcons}
              />
            </div>

            {/* Margin */}
            <div>
              <label className="block text-xs font-medium mb-1">Margin</label>
              <OptionSlider
                value={state.margin}
                onChange={v => (generatorState.margin = v)}
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Margin Noise */}
            <div>
              <label className="block text-xs font-medium mb-1">Margin Noise</label>
              <label className="flex items-center gap-1 text-xs">
                <OptionCheckbox
                  value={state.marginNoise}
                  onChange={v => (generatorState.marginNoise = v)}
                />
                Add random data points
              </label>
            </div>

            {state.marginNoise && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Noise Rate</label>
                  <OptionSlider
                    value={state.marginNoiseRate}
                    onChange={v => (generatorState.marginNoiseRate = v)}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Opacity</label>
                  <OptionSlider
                    value={state.marginNoiseOpacity as any}
                    onChange={v => (generatorState.marginNoiseOpacity = v as any)}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>
              </>
            )}

            {/* Safe Space */}
            <div>
              <label className="block text-xs font-medium mb-1">Safe Space</label>
              <OptionSelectGroup
                value={state.marginNoiseSpace}
                onChange={v => (generatorState.marginNoiseSpace = v as any)}
                options={['full', 'marker', 'minimal', 'extreme', 'none']}
              />
            </div>

            {/* Render Type */}
            <div>
              <label className="block text-xs font-medium mb-1">Render Type</label>
              <OptionSelectGroup
                value={state.renderPointsType}
                onChange={v => (generatorState.renderPointsType = v as any)}
                options={['all', 'function', 'data', 'guide', 'marker']}
              />
            </div>

            {/* Seed */}
            <div>
              <label className="block text-xs font-medium mb-1">Seed</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={state.seed}
                  onChange={e => (generatorState.seed = Number(e.target.value))}
                  className="flex-1 p-1 border border-gray-300 rounded text-sm"
                />
                <button
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => (generatorState.seed = Math.round(Math.random() * 100000))}
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="block text-xs font-medium mb-1">Background</label>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => (generatorState.backgroundImage = '#888888')}
                >
                  🎨 Color
                </button>
                <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                  📁 Upload
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-medium mb-1">Colors</label>
              <div className="flex items-center gap-2">
                <OptionColor
                  value={state.lightColor}
                  onChange={v => (generatorState.lightColor = v)}
                />
                <OptionColor
                  value={state.darkColor}
                  onChange={v => (generatorState.darkColor = v)}
                />
                <label className="flex items-center gap-1 text-xs">
                  <OptionCheckbox
                    value={state.invert}
                    onChange={v => (generatorState.invert = v)}
                  />
                  Invert
                </label>
              </div>
            </div>

            {/* Version Settings */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Min Ver</label>
                <OptionSlider
                  value={state.minVersion}
                  onChange={v => (generatorState.minVersion = v)}
                  min={1}
                  max={state.maxVersion}
                  step={1}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Max Ver</label>
                <OptionSlider
                  value={state.maxVersion}
                  onChange={v => (generatorState.maxVersion = v)}
                  min={state.minVersion}
                  max={40}
                  step={1}
                />
              </div>
            </div>

            {/* Pixel Size */}
            <div>
              <label className="block text-xs font-medium mb-1">Pixel Size</label>
              <OptionSlider
                value={state.scale}
                onChange={v => (generatorState.scale = v)}
                min={1}
                max={50}
                step={1}
                unit="px"
              />
            </div>

            {/* Effect */}
            <div>
              <label className="block text-xs font-medium mb-1">Effect</label>
              <OptionSelectGroup
                value={state.effect}
                onChange={v => (generatorState.effect = v as any)}
                options={['none', 'crystalize', 'liquidify']}
              />
            </div>

            {state.effect === 'crystalize' && (
              <div>
                <label className="block text-xs font-medium mb-1">Radius</label>
                <OptionSlider
                  value={state.effectCrystalizeRadius}
                  onChange={v => (generatorState.effectCrystalizeRadius = v)}
                  min={1}
                  max={20}
                  step={0.5}
                />
              </div>
            )}
            
            {state.effect === 'liquidify' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Distort Radius</label>
                  <OptionSlider
                    value={state.effectLiquidifyDistortRadius}
                    onChange={v => (generatorState.effectLiquidifyDistortRadius = v)}
                    min={1}
                    max={40}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Blur Radius</label>
                  <OptionSlider
                    value={state.effectLiquidifyRadius}
                    onChange={v => (generatorState.effectLiquidifyRadius = v)}
                    min={1}
                    max={40}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Threshold</label>
                  <OptionSlider
                    value={state.effectLiquidifyThreshold}
                    onChange={v => (generatorState.effectLiquidifyThreshold = v)}
                    min={1}
                    max={254}
                    step={1}
                    unit="/256"
                  />
                </div>
              </>
            )}

            {state.effect !== 'none' && (
              <div>
                <label className="block text-xs font-medium mb-1">Effect Timing</label>
                <OptionSelectGroup
                  value={state.effectTiming}
                  onChange={v => (generatorState.effectTiming = v as any)}
                  options={['before', 'after']}
                />
              </div>
            )}
          </div>
        </div>

        {/* QR Code Display - More compact */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
          <canvas 
            ref={canvas} 
            className="border border-gray-300 rounded mb-3"
            style={{ maxWidth: '400px', maxHeight: '400px' }}
          />
          <div className="text-center space-y-2">
            <div className="text-xs text-gray-600">
              Size: 300x300 | Version: 2 | Mask: 4
            </div>
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
              📥 Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

AdvancedQrGenerator.displayName = 'AdvancedQrGenerator'
