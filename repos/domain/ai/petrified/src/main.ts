import { NestFactory } from '@nestjs/core'

import { requireNumberEnv } from '@pack/env-orchestration'
import { AppModule } from './petrified.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(requireNumberEnv('PORT'))
}

bootstrap().catch((error: unknown) => {
  console.error('[petrified] Startup failed:', error)
  process.exit(1)
})
