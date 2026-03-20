import { atom } from 'jotai'

import { volume } from '@state'

export const volumeAtom = atom<number>(volume)
