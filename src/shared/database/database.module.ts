import { Module } from '@nestjs/common';
import { DatabaseServicePg } from './postgres/dataBasePg.service';
import { DatabaseServiceOracle } from './oracle/dataBaseOracle.service';

@Module({
  providers: [DatabaseServicePg, DatabaseServiceOracle],
  exports: [DatabaseServicePg, DatabaseServiceOracle],
})
export class DatabaseModule {}
