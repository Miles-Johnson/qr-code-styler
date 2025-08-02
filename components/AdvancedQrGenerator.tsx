'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { generateQRCode } from '../src/lib/generate'
import { generatorState } from '../src/lib/store'
import { PixelStyleIcons, PixelStyles } from '../src/lib/types'
import { OptionItem } from './OptionItem'
import { OptionSelectGroup } from './OptionSelectGroup'
import { OptionCheckbox } from './OptionCheckbox'
import { SettingsMarkerStyle } from './SettingsMarkerStyle'
import { SettingsMargin } from './SettingsMargin'
import { MarkerSubShapeIcons, MarkerSubShapes } from '../src/lib/types'
import { SettingsRandomRange } from './SettingsRandomRange'
import { OptionSlider } from './OptionSlider'
import { OptionColor } from './OptionColor'
import { ImageUpload } from './ImageUpload'
import { ScrollArea } from '../components/ui/scroll-area'

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
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <h1 className="text-xl font-semibold">QR Code Generator</h1>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Controls Panel - Scrollable */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <ScrollArea className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Text to encode:</label>
              <textarea
                value={state.text}
                onChange={e => (generatorState.text = e.target.value)}
                placeholder="Enter text or URL"
                className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                rows={3}
              />
            </div>

            {/* Error Correction */}
            <OptionItem title="Error Correction" div>
              <OptionSelectGroup
                value={state.ecc}
                onChange={v => (generatorState.ecc = v as 'L' | 'M' | 'Q' | 'H')}
                options={['L', 'M', 'Q', 'H']}
              />
              <label className="flex items-center gap-2 ml-2">
                <OptionCheckbox
                  value={state.boostECC}
                  onChange={v => (generatorState.boostECC = v)}
                />
                <span className="text-sm opacity-75">Boost ECC</span>
              </label>
            </OptionItem>

            {/* Mask Pattern */}
            <OptionItem title="Mask Pattern">
              <OptionSelectGroup
                value={state.maskPattern}
                onChange={v => (generatorState.maskPattern = v as number)}
                options={[-1, 0, 1, 2, 3, 4, 5, 6, 7]}
                titles={['Auto', '0', '1', '2', '3', '4', '5', '6', '7']}
              />
            </OptionItem>

            {/* Rotate */}
            <OptionItem title="Rotate" div>
              <OptionSelectGroup
                value={state.rotate}
                onChange={v => (generatorState.rotate = v as 0 | 90 | 180 | 270)}
                options={[0, 90, 180, 270]}
                titles={['0°', '90°', '180°', '270°']}
              />
            </OptionItem>

            <div className="border-t border-gray-200 my-4" />

            {/* Pixel Style */}
            <OptionItem title="Pixel Style">
              <OptionSelectGroup
                value={state.pixelStyle}
                onChange={v => (generatorState.pixelStyle = v as any)}
                options={PixelStyles}
                classes={PixelStyleIcons}
              />
            </OptionItem>

            {/* Markers */}
            <OptionItem title="Markers">
              <div className="flex-auto" />
              <button
                className="text-xs p-1 border border-gray-200 rounded-lg"
                onClick={() => {
                  if (!generatorState.markers?.length) {
                    generatorState.markers = [
                      {
                        markerShape: generatorState.markerShape,
                        markerStyle: generatorState.markerStyle,
                        markerInnerShape: generatorState.markerInnerShape,
                      },
                      {
                        markerShape: generatorState.markerShape,
                        markerStyle: generatorState.markerStyle,
                        markerInnerShape: generatorState.markerInnerShape,
                      },
                    ]
                  } else {
                    generatorState.markers = []
                  }
                }}
              >
                {state.markers?.length ? 'Collapse' : 'Expand'}
              </button>
            </OptionItem>

            {!state.markers?.length ? (
              <SettingsMarkerStyle state={generatorState} nested />
            ) : (
              <>
                <SettingsMarkerStyle state={generatorState} nested number="1" />
                <OptionItem title="Marker 2"><></></OptionItem>
                <SettingsMarkerStyle state={generatorState.markers?.[0]} nested />
                <OptionItem title="Marker 3"><></></OptionItem>
                <SettingsMarkerStyle state={generatorState.markers?.[1]} nested />
                <div className="border-t border-gray-200 my-1" />
              </>
            )}

            {/* Sub Markers */}
            <OptionItem title="Sub Markers">
              <OptionSelectGroup
                value={state.markerSub}
                onChange={v => (generatorState.markerSub = v as any)}
                options={MarkerSubShapes}
                classes={MarkerSubShapeIcons}
              />
            </OptionItem>

            <div className="border-t border-gray-200 my-4" />

            {/* Margin */}
            <SettingsMargin
              value={state.margin}
              onChange={v => (generatorState.margin = v)}
              fullCustomizable
            />

            {/* Margin Noise */}
            <OptionItem title="Margin Noise" description="Add some random data points to the margin">
              <OptionCheckbox
                value={state.marginNoise}
                onChange={v => (generatorState.marginNoise = v)}
              />
            </OptionItem>

            {state.marginNoise && (
              <>
                <OptionItem title="Noise Rate" nested description="Percentage of whether a black point should be placed">
                  <OptionSlider
                    value={state.marginNoiseRate}
                    onChange={v => (generatorState.marginNoiseRate = v)}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </OptionItem>

                <SettingsRandomRange
                  value={state.marginNoiseOpacity as any}
                  onChange={v => (generatorState.marginNoiseOpacity = v as any)}
                  title="Opacity"
                  nested
                  min={0}
                  max={1}
                  step={0.01}
                />
              </>
            )}

            {/* Safe Space */}
            <OptionItem title="Safe Space">
              <OptionSelectGroup
                value={state.marginNoiseSpace}
                onChange={v => (generatorState.marginNoiseSpace = v as any)}
                options={['full', 'marker', 'minimal', 'extreme', 'none']}
              />
            </OptionItem>

            <div className="border-t border-gray-200 my-4" />

            {/* Render Type */}
            <OptionItem title="Render Type">
              <OptionSelectGroup
                value={state.renderPointsType}
                onChange={v => (generatorState.renderPointsType = v as any)}
                options={['all', 'function', 'data', 'guide', 'marker']}
              />
            </OptionItem>

            {/* Seed */}
            <OptionItem title="Seed">
              <input
                type="number"
                value={state.seed}
                onChange={e => (generatorState.seed = Number(e.target.value))}
                className="w-24 p-2 border border-gray-200 rounded-lg"
              />
              <button
                className="p-1 text-xs border border-gray-200 rounded-lg"
                onClick={() => (generatorState.seed = Math.round(Math.random() * 100000))}
              >
                <div className="i-ri-refresh-line" />
              </button>
            </OptionItem>

            {/* Background */}
            <OptionItem title="Background" div>
              {state.backgroundImage?.startsWith('#') ? (
                <OptionColor
                  value={state.backgroundImage}
                  onChange={v => (generatorState.backgroundImage = v)}
                />
              ) : (
                <button className="relative text-xs p-1 border border-gray-200 rounded-lg">
                  {state.backgroundImage && (
                    <img
                      src={state.backgroundImage}
                      className="absolute inset-0 z-0 w-full h-full rounded object-cover opacity-50"
                      alt=""
                    />
                  )}
                  <div className="z-1">📁 Upload</div>
                  <ImageUpload onChange={v => (generatorState.backgroundImage = v)} />
                </button>
              )}
              {state.backgroundImage && (
                <button
                  className="p-1 text-xs border border-gray-200 rounded-lg"
                  onClick={() => (generatorState.backgroundImage = undefined)}
                >
                  <div className="i-carbon-close" />
                </button>
              )}
              <div className="flex-auto" />
              {!state.backgroundImage && (
                <button
                  className="p-1 text-xs border border-gray-200 rounded-lg"
                  onClick={() => (generatorState.backgroundImage = '#888888')}
                >
                  <div className="i-ri-paint-fill" />
                </button>
              )}
            </OptionItem>

            <div className="border-t border-gray-200 my-4" />

            {/* Colors */}
            <OptionItem title="Colors" div onReset={() => {
              generatorState.lightColor = '#ffffff'
              generatorState.darkColor = '#000000'
            }}>
              <div className="flex gap-2">
                <OptionColor
                  value={state.lightColor}
                  onChange={v => (generatorState.lightColor = v)}
                />
                <OptionColor
                  value={state.darkColor}
                  onChange={v => (generatorState.darkColor = v)}
                />
                <label className="flex items-center gap-2 ml-2">
                  <OptionCheckbox
                    value={state.invert}
                    onChange={v => (generatorState.invert = v)}
                  />
                  <span className="text-sm opacity-75">Invert</span>
                </label>
              </div>
            </OptionItem>

            <div className="border-t border-gray-200 my-4" />

            {/* Version Settings */}
            <OptionItem title="Min Version">
              <OptionSlider
                value={state.minVersion}
                onChange={v => (generatorState.minVersion = v)}
                min={1}
                max={state.maxVersion}
                step={1}
              />
            </OptionItem>

            <OptionItem title="Max Version">
              <OptionSlider
                value={state.maxVersion}
                onChange={v => (generatorState.maxVersion = v)}
                min={state.minVersion}
                max={40}
                step={1}
              />
            </OptionItem>

            {/* Pixel Size */}
            <OptionItem title="Pixel Size">
              <OptionSlider
                value={state.scale}
                onChange={v => (generatorState.scale = v)}
                min={1}
                max={50}
                step={1}
                unit="px"
              />
            </OptionItem>

            <div className="border-t border-gray-200 my-4" />

            {/* Effect */}
            <OptionItem title="Effect">
              <OptionSelectGroup
                value={state.effect}
                onChange={v => (generatorState.effect = v as any)}
                options={['none', 'crystalize', 'liquidify']}
              />
            </OptionItem>

            {state.effect === 'crystalize' && (
              <OptionItem title="Radius" nested>
                <OptionSlider
                  value={state.effectCrystalizeRadius}
                  onChange={v => (generatorState.effectCrystalizeRadius = v)}
                  min={1}
                  max={20}
                  step={0.5}
                />
              </OptionItem>
            )}
            
            {state.effect === 'liquidify' && (
              <>
                <OptionItem title="Distort Radius" nested>
                  <OptionSlider
                    value={state.effectLiquidifyDistortRadius}
                    onChange={v => (generatorState.effectLiquidifyDistortRadius = v)}
                    min={1}
                    max={40}
                    step={1}
                  />
                </OptionItem>
                <OptionItem title="Blur Radius" nested>
                  <OptionSlider
                    value={state.effectLiquidifyRadius}
                    onChange={v => (generatorState.effectLiquidifyRadius = v)}
                    min={1}
                    max={40}
                    step={1}
                  />
                </OptionItem>
                <OptionItem title="Threshold" nested onReset={() => (generatorState.effectLiquidifyThreshold = 128)}>
                  <OptionSlider
                    value={state.effectLiquidifyThreshold}
                    onChange={v => (generatorState.effectLiquidifyThreshold = v)}
                    min={1}
                    max={254}
                    step={1}
                    unit="/256"
                  />
                </OptionItem>
              </>
            )}

            {state.effect !== 'none' && (
              <OptionItem title="Effect Timing">
                <OptionSelectGroup
                  value={state.effectTiming}
                  onChange={v => (generatorState.effectTiming = v as any)}
                  options={['before', 'after']}
                />
              </OptionItem>
            )}
          </ScrollArea>
        </div>

        {/* QR Code Display - Fixed */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <canvas 
              ref={canvas} 
              className="max-w-full max-h-full border border-gray-300 rounded"
              style={{ maxWidth: '400px', maxHeight: '400px' }}
            />
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600 mb-2">
                Size: 300x300 | Version: 2 | Mask: 4
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                📥 Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

AdvancedQrGenerator.displayName = 'AdvancedQrGenerator'
