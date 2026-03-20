import { ErrorInfo } from 'react'

export interface LoggerContext {
  stack: ErrorInfo['componentStack']
}

export interface Logger {
  log: (message: string, context: LoggerContext) => void
}
