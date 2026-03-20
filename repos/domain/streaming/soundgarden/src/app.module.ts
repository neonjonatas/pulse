import { Module } from '@nestjs/common'

import { SoundgardenModule } from './soundgarden/soundgarden.module'

@Module({
  imports: [SoundgardenModule]
})
export class AppModule {}
