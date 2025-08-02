import { proxy } from 'valtio'
import type { QRCodeGeneratorState } from './types'
import { defaultGeneratorState } from './state'

export const generatorState = proxy<QRCodeGeneratorState>(defaultGeneratorState())
