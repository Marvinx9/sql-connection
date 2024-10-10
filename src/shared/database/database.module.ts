import { Module } from '@nestjs/common';
import { DatabaseService } from './Database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
