import { NestFactory } from '@nestjs/core'

import { requireNumberEnv } from './hybrid-storage/infra/env'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = requireNumberEnv('PORT')

  await app.listen(port)
  console.log(`[HybridStorage] Listening on port ${port}`)
}

bootstrap()
