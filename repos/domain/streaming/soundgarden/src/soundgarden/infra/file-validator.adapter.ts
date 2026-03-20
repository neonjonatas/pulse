import { Injectable } from '@nestjs/common'

import {
  FileValidatorPort,
  type ValidationFailure,
  type ValidationResult
} from '@domain/ports'

const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/wav'] as const
const ALLOWED_EXTENSIONS = ['.mp3', '.wav'] as const

const EXTENSION_MIME_MAP: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
}

@Injectable()
export class FileValidatorAdapter extends FileValidatorPort {
  async validate(
    file: Express.Multer.File,
    maxSizeBytes: number
  ): Promise<ValidationResult | ValidationFailure> {
    if (!file || !file.buffer) {
      return {
        success: false,
        errorCode: 'UPLOAD_INTERRUPTED',
        message: 'File is missing or upload was interrupted'
      }
    }

    const fileSize = file.size ?? file.buffer?.length ?? 0

    if (fileSize > maxSizeBytes) {
      return {
        success: false,
        errorCode: 'FILE_TOO_LARGE',
        message: 'File exceeds maximum allowed size'
      }
    }

    const rawMime = file.mimetype ?? ''
    const ext = this.getExtension(file.originalname ?? '')
    const extOk = ALLOWED_EXTENSIONS.includes(
      ext as (typeof ALLOWED_EXTENSIONS)[number]
    )

    if (!extOk) {
      return {
        success: false,
        errorCode: 'UNSUPPORTED_FORMAT',
        message: 'File format is not supported. Use .mp3 or .wav'
      }
    }

    const isGenericMime =
      rawMime === 'application/octet-stream' || rawMime === ''

    const mimeOk = ALLOWED_MIME_TYPES.includes(
      rawMime as (typeof ALLOWED_MIME_TYPES)[number]
    )

    if (!mimeOk && !isGenericMime) {
      return {
        success: false,
        errorCode: 'UNSUPPORTED_FORMAT',
        message: 'File format is not supported. Use .mp3 or .wav'
      }
    }

    // Derive canonical MIME from extension when client sends a generic type.
    const mimeType = isGenericMime
      ? (EXTENSION_MIME_MAP[ext] ?? rawMime)
      : rawMime

    return {
      success: true,
      mimeType,
      fileSize
    }
  }

  private getExtension(filename: string): string {
    const i = filename.lastIndexOf('.')
    return i >= 0 ? filename.slice(i).toLowerCase() : ''
  }
}
