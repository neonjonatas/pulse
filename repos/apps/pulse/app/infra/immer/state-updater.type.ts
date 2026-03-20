import type { Draft } from 'immer'

export type StateUpdater<State> = (
  recipe: (draft: Draft<State>) => void
) => void
