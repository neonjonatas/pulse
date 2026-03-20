import { Controller, Get } from '@nestjs/common'

/** Exposes a `GET /health` endpoint for infrastructure and agent health checks. */
@Controller()
export class HealthController {
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' }
  }
}
