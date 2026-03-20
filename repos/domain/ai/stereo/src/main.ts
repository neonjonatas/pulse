import { NestFactory } from '@nestjs/core'

import { requireNumberEnv } from '@pack/env-orchestration'
import { AppModule } from './stereo.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(requireNumberEnv('PORT'))
}

bootstrap().catch((error: unknown) => {
  console.error('[stereo] Startup failed:', error)
  process.exit(1)
})
