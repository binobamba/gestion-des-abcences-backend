import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { typeOrmConfig } from './config/orm.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DemandeAbsenceModule } from './modules/demande-absence/demande-absence.module';

@Module({
  imports: [
    AppConfig, // Configuration globale
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DemandeAbsenceModule,
  ],
})
export class AppModule {}