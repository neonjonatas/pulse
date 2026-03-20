import {
  type HttpError,
  type HttpErrorMeta,
  HttpErrorName
} from '@api/transport/http'

export class ErrorFactoryService {
  private readonly statusIndex: Map<number, HttpErrorName>

  constructor(private readonly errorMap: Record<HttpErrorName, HttpErrorMeta>) {
    this.statusIndex = new Map(
      Object.entries(errorMap).map(([name, meta]) => [
        meta.status,
        name as HttpErrorName
      ])
    )
  }

  create(name: HttpErrorName): HttpError {
    const meta = this.errorMap[name]

    return {
      name,
      status: meta.status,
      message: meta.message,
      retryable: meta.retryable
    }
  }

  fromStatus(status: number): HttpError {
    const name =
      this.statusIndex.get(status) ?? HttpErrorName.InternalServerError

    return this.create(name)
  }
}
