import type { QRCodeGeneratorState } from '../lib/types'

import { proxy } from 'valtio'

export const qrcode = proxy({ value: null as any })
export const generateQRCodeInfo = proxy({ value: null as any })
export const dataUrlGeneratedQRCode = proxy({ value: null as any })

export function defaultGeneratorState(): QRCodeGeneratorState {
  return {
    text: '',
    ecc: 'M',
    margin: 2,
    scale: 20,
    lightColor: '#ffffff',
    darkColor: '#000000',
    pixelStyle: 'rounded',
    markerStyle: 'auto',
    markerShape: 'square',
    markerInnerShape: 'auto',
    markerSub: 'square',
    markers: [],
    maskPattern: -1,
    minVersion: 1,
    maxVersion: 40,
    boostECC: false,
    rotate: 0,
    invert: false,
    marginNoise: false,
    marginNoiseRate: 0.5,
    marginNoiseOpacity: 1,
    seed: Math.round(Math.random() * 1000000),
    marginNoiseSpace: 'marker',
    renderPointsType: 'all',

    effect: 'none',
    effectTiming: 'after',
    effectCrystalizeRadius: 8,
    effectLiquidifyDistortRadius: 8,
    effectLiquidifyRadius: 8,
    effectLiquidifyThreshold: 128,

    transformPerspectiveX: 0,
    transformPerspectiveY: 0,
    transformScale: 1,
  }
}
