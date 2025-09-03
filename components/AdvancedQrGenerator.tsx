'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { download, generateQRCode } from '../src/lib/generate'
import { generatorState } from '../src/lib/store'
import { dataUrlGeneratedQRCode, isModalOpen } from '../src/lib/state'
import { PixelStyleIcons, PixelStyles, MarkerShapes, MarkerInnerShapes, MarkerSubShapes, MarkerSubShapeIcons, MarkerShape, MarkerInnerShape, MarkerShapeIcons, MarkerInnerShapeIcons } from '../src/lib/types'
import { OptionSelectGroup } from './OptionSelectGroup'
import { OptionCheckbox } from './OptionCheckbox'
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
        {/* Controls Panel */}
        <div className="w-full bg-white border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column (Functional) */}
              <div className="space-y-3">
                {/* Presets */}
                <div>
                  <label className="block text-xs font-medium mb-1">Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Minimal</button>
                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Playful</button>
                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Corporate</button>
                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Futuristic</button>
                  </div>
                </div>

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

                {/* Rotate */}
                <div>
                  <label className="block text-xs font-medium mb-1">Rotate</label>
                  <OptionSelectGroup
                    value={state.rotate}
                    onChange={v => (generatorState.rotate = Number(v) as 0 | 90 | 180 | 270)}
                    options={[0, 90, 180, 270]}
                    titles={['0°', '90°', '180°', '270°']}
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
              </div>

              {/* Right Column (Stylistic) */}
              <div className="space-y-3">
                {/* Pixel Style */}
                <div>
                  <label className="block text-xs font-medium mb-1">Pixel Style</label>
                  <OptionSelectGroup
                    value={state.pixelStyle}
                    onChange={v => (generatorState.pixelStyle = v as typeof PixelStyles[number])}
                    options={PixelStyles}
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
                        onChange={v => (generatorState.markerShape = v as MarkerShape)}
                        options={MarkerShapes}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Inner:</span>
                      <OptionSelectGroup
                        value={state.markerInnerShape}
                        onChange={v => (generatorState.markerInnerShape = v as MarkerInnerShape)}
                        options={MarkerInnerShapes}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub Markers */}
                <div>
                  <label className="block text-xs font-medium mb-1">Sub Markers</label>
                  <OptionSelectGroup
                    value={state.markerSub}
                    onChange={v => (generatorState.markerSub = v as MarkerShape)}
                    options={MarkerSubShapes}
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
              </div>
            </div>

            {/* Advanced Section */}
            <details>
              <summary className="text-xs font-medium cursor-pointer">⚙️ Advanced</summary>
              <div className="p-3 mt-2 border border-gray-200 rounded space-y-3">
                {/* Mask Pattern */}
                <div>
                  <label className="block text-xs font-medium mb-1">Mask Pattern</label>
                  <OptionSelectGroup
                    value={state.maskPattern}
                    onChange={v => (generatorState.maskPattern = Number(v))}
                    options={[-1, 0, 1, 2, 3, 4, 5, 6, 7]}
                    titles={['Auto', '0', '1', '2', '3', '4', '5', '6', '7']}
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
                        value={state.marginNoiseOpacity as number}
                        onChange={v => (generatorState.marginNoiseOpacity = v)}
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
                    onChange={v => (generatorState.marginNoiseSpace = v as 'full' | 'marker' | 'minimal' | 'extreme' | 'none')}
                    options={['full', 'marker', 'minimal', 'extreme', 'none']}
                  />
                </div>

                {/* Render Type */}
                <div>
                  <label className="block text-xs font-medium mb-1">Render Type</label>
                  <OptionSelectGroup
                    value={state.renderPointsType}
                    onChange={v => (generatorState.renderPointsType = v as 'all' | 'function' | 'data' | 'guide' | 'marker')}
                    options={['all', 'function', 'data', 'guide', 'marker']}
                  />
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

                {/* Effect */}
                <div>
                  <label className="block text-xs font-medium mb-1">Effect</label>
                  <OptionSelectGroup
                    value={state.effect}
                    onChange={v => (generatorState.effect = v as 'none' | 'crystalize' | 'liquidify')}
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
                      onChange={v => (generatorState.effectTiming = v as 'before' | 'after')}
                      options={['before', 'after']}
                    />
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
          <div className="flex flex-col items-center space-y-4">
            <canvas 
              ref={canvas} 
              className="border border-gray-300 rounded"
              style={{ width: '500px', height: '500px' }}
            />
            <div className="text-center space-y-2">
              <div className="text-xs text-gray-600">
                Size: 500x500 | Version: 2 | Mask: 4
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  onClick={() => download(canvas.current!, 'qrcode.png')}
                >
                  📥 Download
                </button>
                <button 
                  className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  onClick={() => {
                    if (canvas.current) {
                      dataUrlGeneratedQRCode.value = canvas.current.toDataURL()
                      isModalOpen.value = false
                    }
                  }}
                >
                  🚀 Use Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

AdvancedQrGenerator.displayName = 'AdvancedQrGenerator'
