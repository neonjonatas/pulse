import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

import {
  UploadTrackUseCase,
  UploadStorageError,
  UploadValidationError
} from '@application/use-cases'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

@Controller('tracks')
export class UploadController {
  constructor(private readonly uploadTrack: UploadTrackUseCase) {}

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async upload(
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ trackId: string; status: string }> {
    if (!file) {
      throw new BadRequestException({
        errorCode: 'UPLOAD_INTERRUPTED',
        message: 'No file provided'
      })
    }

    try {
      const result = await this.uploadTrack.execute({ file })
      return { ...result, status: 'uploaded' }
    } catch (error) {
      if (error instanceof UploadValidationError) {
        throw new BadRequestException({
          errorCode: error.errorCode,
          message: error.message
        })
      }
      if (error instanceof UploadStorageError) {
        throw new BadRequestException({
          errorCode: 'STORAGE_FAILED',
          message: error.message
        })
      }
      throw error
    }
  }
}
