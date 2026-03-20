import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { requireNumberEnv } from '@pack/env-orchestration'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = requireNumberEnv('PORT')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  await app.listen(port)
}

bootstrap()
