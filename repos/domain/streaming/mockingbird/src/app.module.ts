import { Module } from '@nestjs/common'

import { MockingbirdModule } from './mockingbird/mockingbird.module'

@Module({
  imports: [MockingbirdModule]
})
export class AppModule {}
