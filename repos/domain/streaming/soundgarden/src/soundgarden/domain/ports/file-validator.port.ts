export type ValidationErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'CORRUPTED_FILE'
  | 'UPLOAD_INTERRUPTED'

export interface ValidationResult {
  success: true
  mimeType: string
  fileSize: number
}

export interface ValidationFailure {
  success: false
  errorCode: ValidationErrorCode
  message: string
}

export abstract class FileValidatorPort {
  abstract validate(
    file: Express.Multer.File,
    maxSizeBytes: number
  ): Promise<ValidationResult | ValidationFailure>
}
