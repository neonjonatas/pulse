import { Progress, Volume } from './domain'

/* =================
  System Data
================== */
export const isAuthenticated = true

/* =================
  Player State Data
================== */
export const progress = {
  milliseconds: 0
} satisfies Progress
export const volume = Number(Volume.Quiet)
export const theme = 'system'
export const isPaused = true
export const isReasoning = true

/* =================
  Page Metadata
================== */
export const description = 'The app that hates your > 2000s songs. 😤'
export const robots = {
  index: false,
  follow: false
}
