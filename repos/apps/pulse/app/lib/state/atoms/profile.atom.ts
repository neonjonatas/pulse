import { atomWithImmer } from 'jotai-immer'

import type { Profile } from '@domain'
import { profileMock } from '@mocks'

export const profileAtom = atomWithImmer<Profile>(profileMock)
