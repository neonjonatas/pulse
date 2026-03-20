import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  BroadcastPipelineEventUseCase,
  GetTrackPipelineUseCase,
  ListActivePipelinesUseCase,
  ListAllPipelinesUseCase,
  ListFailedPipelinesUseCase,
  RecordPipelineEventUseCase
} from '@application/use-cases'
import { EventStreamPortToken } from '@application/ports/event-stream.port'
import { PipelineRepositoryPort } from '@domain/repositories'
import {
  natsConnectionProvider,
  NatsLifecycleService
} from '@pack/nats-broker-messaging'
import { MockEventGeneratorService } from '@infra/mock/mock-event-generator.service'
import {
  MongoPipelineAdapter,
  TrackPipelineDocument,
  TrackPipelineSchemaDefinition
} from '@infra/persistence'
import { SocketIOEventStreamAdapter } from '@infra/websocket/socketio-event-stream.adapter'
import { SseStreamRegistry } from '@infra/sse/sse-stream.registry'
import { SseEventStreamAdapter } from '@infra/sse/sse-event-stream.adapter'
import {
  HealthController,
  PipelinesController,
  SsePipelineController
} from '@interface/http'
import { PipelineEventConsumer } from '@interface/event-handlers/pipeline-event.consumer'
import { PipelineGateway } from '@interface/gateways/pipeline.gateway'

const useSse = process.env.USE_SSE === 'true'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TrackPipelineDocument.name,
        schema: TrackPipelineSchemaDefinition
      }
    ])
  ],
  controllers: [
    HealthController,
    PipelinesController,
    ...(useSse ? [SsePipelineController] : [])
  ],
  providers: [
    PipelineGateway,
    SseStreamRegistry,
    BroadcastPipelineEventUseCase,
    GetTrackPipelineUseCase,
    ListActivePipelinesUseCase,
    ListAllPipelinesUseCase,
    ListFailedPipelinesUseCase,
    RecordPipelineEventUseCase,
    MockEventGeneratorService,
    PipelineEventConsumer,
    natsConnectionProvider,
    NatsLifecycleService,
    {
      provide: EventStreamPortToken,
      useFactory: (gateway: PipelineGateway, sseRegistry: SseStreamRegistry) =>
        useSse
          ? new SseEventStreamAdapter(sseRegistry)
          : new SocketIOEventStreamAdapter(gateway),
      inject: [PipelineGateway, SseStreamRegistry]
    },
    {
      provide: PipelineRepositoryPort,
      useClass: MongoPipelineAdapter
    }
  ]
})
export class BackstageModule {}
