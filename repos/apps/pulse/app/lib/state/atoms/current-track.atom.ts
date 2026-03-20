import { atomWithImmer } from 'jotai-immer'

import type { CurrentTrack } from '@domain'
import { somewhereIBelongTrackMetadataMock } from '@mocks'

export const currentTrackAtom = atomWithImmer<CurrentTrack>(
  somewhereIBelongTrackMetadataMock
)
