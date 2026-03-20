import { Module } from '@nestjs/common'

import { HybridStorageModule } from './hybrid-storage/hybrid-storage.module'

@Module({
  imports: [HybridStorageModule]
})
export class AppModule {}
