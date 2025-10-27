import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StatistiquesDTO {
  @ApiProperty({ example: 128, description: 'Nombre total de demandes' })
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty({ example: 132, description: 'Nombre de demandes approuvées' })
  @IsNumber()
  @IsNotEmpty()
  utilisee: number;

  @ApiProperty({ example: 18, description: 'Nombre de demandes en attente' })
  @IsNumber()
  @IsNotEmpty()
  enAttent: number;

  @ApiProperty({ example: 6, description: 'Nombre de demandes rejetées ou annulées' })
  @IsNumber()
  @IsNotEmpty()
  restant: number;
}
