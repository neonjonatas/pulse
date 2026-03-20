import { TrackPipeline } from '@domain/entities'

export abstract class PipelineRepositoryPort {
  abstract save(pipeline: TrackPipeline): Promise<void>
  abstract findById(trackId: string): Promise<TrackPipeline | null>
  abstract findActive(): Promise<TrackPipeline[]>
  abstract findFailed(): Promise<TrackPipeline[]>
  abstract findAll(): Promise<TrackPipeline[]>
}
