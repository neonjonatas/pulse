import { CurrentTrack } from '@domain'

import { somewhereIBelongTrackMetadataMock } from './track-metadata.mocks'

export const currentTrackMock =
  somewhereIBelongTrackMetadataMock satisfies CurrentTrack
