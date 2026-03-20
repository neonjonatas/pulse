import { atom } from 'jotai'

import { isAuthenticated } from '@state'

export const isAuthenticatedAtom = atom<boolean>(isAuthenticated)
