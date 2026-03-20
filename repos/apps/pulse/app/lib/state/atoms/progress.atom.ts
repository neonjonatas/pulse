import { atom } from 'jotai'

import type { Progress } from '@domain'
import { progress } from '@state'

export const progressAtom = atom<Progress>(progress)
