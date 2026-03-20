import { atom } from 'jotai'

import type { Session } from '@domain'
import { sessionMock } from '@mocks'

export const sessionAtom = atom<Session>(sessionMock)
