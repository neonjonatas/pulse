import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { requireStringEnv } from '@pack/env-orchestration'

import { BackstageModule } from './backstage/backstage.module'

const MONGO_URI = requireStringEnv('MONGO_URI')
const MONGO_DB_NAME = requireStringEnv('MONGO_DB_NAME')

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI, { dbName: MONGO_DB_NAME }),
    BackstageModule
  ]
})
export class AppModule {}
