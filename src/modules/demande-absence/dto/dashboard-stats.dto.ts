import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total des jours de congés disponibles' })
  totalDays: number;

  @ApiProperty({ description: 'Jours de congés utilisés' })
  usedDays: number;

  @ApiProperty({ description: 'Jours de congés restants' })
  remainingDays: number;

  @ApiProperty({ description: 'Jours en attente de validation' })
  pendingDays: number;

  @ApiProperty({ description: 'Nombre total de demandes' })
  totalRequests: number;

  @ApiProperty({ description: 'Nombre de demandes en attente' })
  pendingRequests: number;

  @ApiProperty({ description: 'Nombre de notifications non lues' })
  unreadNotifications: number;
}