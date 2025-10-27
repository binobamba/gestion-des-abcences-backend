import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DemandeAbsence } from '../demande-absence/entities/demande-absence.entity';



@Module({
  imports: [TypeOrmModule.forFeature([User,DemandeAbsence]),
    JwtModule,
], 
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
