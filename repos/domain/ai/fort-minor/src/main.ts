import { NestFactory } from '@nestjs/core'

import { requireNumberEnv } from '@pack/env-orchestration'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(requireNumberEnv('PORT'))
}

bootstrap().catch((error: unknown) => {
  console.error('[fort-minor] Startup failed:', error)
  process.exit(1)
})
