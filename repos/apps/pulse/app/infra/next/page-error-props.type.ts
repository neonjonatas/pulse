export interface PageErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}
