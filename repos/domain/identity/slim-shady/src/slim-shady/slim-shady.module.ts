import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  natsConnectionProvider,
  NatsLifecycleService
} from '@pack/nats-broker-messaging'

import {
  CompleteOnboardingUseCase,
  CreateUserProfileUseCase,
  GetUserProfileUseCase,
  GetUserProfileByAuthIdUseCase,
  UpdateUserPreferencesUseCase,
  UpdateUserProfileUseCase
} from '@application/use-cases'
import { UserPort } from '@domain/ports'
import {
  MongooseUserAdapter,
  UserSchemaDefinition,
  UserSchemaName
} from '@infra/mongoose'
import { slimShadyEventBusProvider } from '@infra/event-bus'
import { UserSignedUpConsumer } from '@interface/consumers/user-signed-up.consumer'
import { UserProfileController, HealthController } from '@interface/http'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchemaName, schema: UserSchemaDefinition }
    ])
  ],

  controllers: [UserProfileController, HealthController],

  providers: [
    CreateUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserProfileUseCase,
    GetUserProfileByAuthIdUseCase,
    UpdateUserPreferencesUseCase,
    CompleteOnboardingUseCase,
    UserSignedUpConsumer,
    natsConnectionProvider,
    slimShadyEventBusProvider,
    NatsLifecycleService,
    {
      provide: UserPort,
      useClass: MongooseUserAdapter
    }
  ]
})
export class SlimShadyModule {}
