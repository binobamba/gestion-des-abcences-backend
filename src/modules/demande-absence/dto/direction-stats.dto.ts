import { ApiProperty } from '@nestjs/swagger';

export class MonthlyTrendDto {
  @ApiProperty({ description: 'Mois' })
  month: string;

  @ApiProperty({ description: 'Nombre de demandes' })
  requests: number;

  @ApiProperty({ description: 'Taux d\'absence' })
  rate: number;
}

export class DirectionStatsDto {
  @ApiProperty({ description: 'Nombre total d\'employés' })
  totalEmployees: number;

  @ApiProperty({ description: 'Taux d\'absence moyen' })
  avgAbsenceRate: number;

  @ApiProperty({ description: 'Nombre de demandes approuvées' })
  approvalRate: number;

  @ApiProperty({ description: 'Nombre de demandes en attente' })
  pendingRequests: number;

  @ApiProperty({ description: 'Nombre total de demandes' })
  totalRequests: number;

  @ApiProperty({ description: 'Durée moyenne des demandes' })
  averageDuration: number;

  @ApiProperty({ description: 'Type de demande le plus courant' })
  mostCommonType: string;

  @ApiProperty({ description: 'Taux de productivité' })
  productivityRate: number;
}