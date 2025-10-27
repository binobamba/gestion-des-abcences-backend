import { PartialType } from '@nestjs/swagger';
import { CreateDemandeAbsenceDto } from './create-demande-absence.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { StatutAbsence } from '../entities/demande-absence.entity';

export class UpdateDemandeAbsenceDto extends PartialType(CreateDemandeAbsenceDto) {
  @IsOptional()
  @IsEnum(StatutAbsence)
  statut?: StatutAbsence;

  @IsOptional()
  @IsString()
  motifRefus?: string;

  @IsOptional()
  @IsString()
  validateById?: number;
}