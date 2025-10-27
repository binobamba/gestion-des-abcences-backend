import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Genre, Role } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'jean.dupont@email.com', description: 'Adresse email unique' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom de famille' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: '123@@', minLength: 6, description: 'Mot de passe de l’utilisateur' })
  @IsString()
  @MinLength(6)
  motDePasse: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date de naissance au format ISO YYYY-MM-DD' })
  @IsDateString()
  dateDeNaissance: string;

  @ApiProperty({ example: 'Paris, France', description: 'Lieu de naissance' })
  @IsString()
  @IsNotEmpty()
  lieuDeNaissance: string;

  @ApiProperty({ enum: Genre, example: Genre.HOMME, description: 'Genre de l’utilisateur' })
  @IsEnum(Genre)
  genre: Genre;

  @ApiProperty({ enum: Role, example: Role.EMPLOYE, description: 'Rôle de l’utilisateur', required: false })
  @IsEnum(Role)
  role: Role;
}
