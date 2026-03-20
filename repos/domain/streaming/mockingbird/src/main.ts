import { NestFactory } from '@nestjs/core'

import { requireNumberEnv } from '@pack/env-orchestration'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = requireNumberEnv('PORT')

  await app.listen(port)
  console.log(`[Mockingbird] Listening on port ${port}`)
}

bootstrap()
