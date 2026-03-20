import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { requireStringEnv } from '@pack/env-orchestration'
import { DbConfigFlag } from '@infra/db'

import { SlimShadyModule } from './slim-shady/slim-shady.module'

@Module({
  imports: [
    MongooseModule.forRoot(requireStringEnv(DbConfigFlag.MongoUri), {
      dbName: requireStringEnv(DbConfigFlag.MongoDbName)
    }),

    SlimShadyModule
  ]
})
export class AppModule {}
