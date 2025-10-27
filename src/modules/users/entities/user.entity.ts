import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export enum Genre {
  HOMME = 'homme',
  FEMME = 'femme',
  AUTRE = 'autre',
}

export enum Role{
  EMPLOYE = 'employee',
  MANAGER = 'manager',
  RH = 'RH',
  DIRECTION  = 'direction',

}

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID unique de l\'utilisateur' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'jean.dupont@email.com', description: 'Adresse email unique' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom de famille' })
  @Column()
  nom: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom' })
  @Column()
  prenom: string;

  @ApiProperty({ description: 'Mot de passe hashé' })
  @Column()
  @Exclude()
  motDePasse: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date de naissance' })
  @Column({ type: 'date' })
  dateDeNaissance: Date;

  @ApiProperty({ example: 'Paris, France', description: 'Lieu de naissance' })
  @Column()
  lieuDeNaissance: string;

    @ApiProperty({ 
    enum:Role,
    example: Role.EMPLOYE, 
    description: 'role de l\'utilisateur' 
  })
  @Column({ 
    type: 'enum', 
    enum: Role, 
    default: Role. EMPLOYE
  })
  role: Role;

  @ApiProperty({ 
    enum: Genre, 
    example: Genre.HOMME, 
    description: 'Genre de l\'utilisateur' 
  })
  @Column({ 
    type: 'enum', 
    enum: Genre, 
    default: Genre.AUTRE 
  })
  genre: Genre;

  @ApiProperty({ description: 'Date de création du compte' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;
}