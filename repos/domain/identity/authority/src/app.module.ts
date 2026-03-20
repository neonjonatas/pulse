import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { requireStringEnv } from '@pack/env-orchestration'
import { DbConfigFlag } from '@infra/db'

import { AuthorityModule } from './authority/authority.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    MongooseModule.forRoot(requireStringEnv(DbConfigFlag.MongoUri), {
      dbName: requireStringEnv(DbConfigFlag.MongoDbName)
    }),

    AuthorityModule
  ]
})
export class AppModule {}
