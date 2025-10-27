import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeAbsenceService } from './demande-absence.service';
import { DemandeAbsenceController } from './demande-absence.controller';
import { DemandeAbsence } from './entities/demande-absence.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DemandeAbsence])], 
  controllers: [DemandeAbsenceController],
  providers: [DemandeAbsenceService],
})
export class DemandeAbsenceModule {}
