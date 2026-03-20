import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { requireStringEnv } from '@pack/env-orchestration'

/** Provides a MongoDB/Mongoose connection scoped to this microservice's own database. */
@Module({
  imports: [
    MongooseModule.forRoot(requireStringEnv('MONGO_URI'), {
      dbName: requireStringEnv('MONGO_DB_NAME')
    })
  ],
  exports: [MongooseModule]
})
export class MongodbModule {}
