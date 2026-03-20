import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param
} from '@nestjs/common'

import {
  GetTrackPipelineUseCase,
  ListActivePipelinesUseCase,
  ListAllPipelinesUseCase,
  ListFailedPipelinesUseCase
} from '@application/use-cases'

@Controller('pipelines')
export class PipelinesController {
  constructor(
    private readonly getTrackPipeline: GetTrackPipelineUseCase,
    private readonly listActivePipelines: ListActivePipelinesUseCase,
    private readonly listFailedPipelines: ListFailedPipelinesUseCase,
    private readonly listAllPipelines: ListAllPipelinesUseCase
  ) {}

  @Get()
  async list(): Promise<unknown[]> {
    const pipelines = await this.listAllPipelines.execute()
    return pipelines.map((p) => p.toJSON())
  }

  @Get('active')
  async listActive(): Promise<unknown[]> {
    const pipelines = await this.listActivePipelines.execute()
    return pipelines.map((p) => p.toJSON())
  }

  @Get('failed')
  async listFailed(): Promise<unknown[]> {
    const pipelines = await this.listFailedPipelines.execute()
    return pipelines.map((p) => p.toJSON())
  }

  @Get(':trackId')
  async getByTrackId(@Param('trackId') trackId: string): Promise<unknown> {
    const pipeline = await this.getTrackPipeline.execute(trackId)

    if (!pipeline) {
      throw new HttpException(
        { message: 'Pipeline not found', trackId },
        HttpStatus.NOT_FOUND
      )
    }

    return pipeline.toJSON()
  }
}
