import { atom } from 'jotai'

import { isPaused } from '@state'

export const isPausedAtom = atom<boolean>(isPaused)
