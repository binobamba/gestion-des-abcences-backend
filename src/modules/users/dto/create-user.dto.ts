import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Genre } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: 'motdepasse123', minLength: 6 })
  @IsString()
  @MinLength(6)
  motDePasse: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  dateDeNaissance: string;

  @ApiProperty({ example: 'Paris, France' })
  @IsString()
  @IsNotEmpty()
  lieuDeNaissance: string;

  @ApiProperty({ enum: Genre, example: Genre.HOMME })
  @IsEnum(Genre)
  genre: Genre;
}