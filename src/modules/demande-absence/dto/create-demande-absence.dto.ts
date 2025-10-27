import { ApiProperty } from '@nestjs/swagger';
import { TypeAbsence, StatutAbsence } from '../entities/demande-absence.entity';
import { IsEnum,IsOptional, IsDateString } from 'class-validator';

export class CreateDemandeAbsenceDto {
  @ApiProperty({ enum: TypeAbsence, example: TypeAbsence.CONGE })
  @IsEnum(TypeAbsence)
  type: TypeAbsence;

  @ApiProperty({ example: '2025-02-01', description: 'Date de début de la période d’absence' })
  @IsDateString()
  dateDebut: Date;

  @ApiProperty({ example: '2025-02-10', description: 'Date de fin de la période d’absence' })
  @IsDateString()
  dateFin: Date;

  @ApiProperty({ example: 'Vacances familiales', required: false })
  @IsOptional()
  motif?: string;

  @ApiProperty({ enum: StatutAbsence, example: StatutAbsence.EN_ATTENTE, required: false })
  @IsOptional()
  @IsEnum(StatutAbsence)
  statut?: StatutAbsence;
}
