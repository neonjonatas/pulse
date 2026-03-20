import { atom } from 'jotai'

import { theme } from '@state'
import { Theme } from '@domain'

export const themeAtom = atom<Theme>(theme)
