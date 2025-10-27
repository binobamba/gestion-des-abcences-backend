// src/demandes-absences/entities/demande-absence.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';

export enum TypeAbsence {
  CONGE = 'conge',
  MALADIE = 'maladie',
  ACCIDENT_TRAVAIL = 'accident_travail',
  MATERNITE = 'maternite',
  PATERNITE = 'paternite',
  RTT = 'rtt',
  PERMISSION = 'permission',
  FORMATION = 'formation',
  TELEWORKING = 'teletravail',
  OTHER = 'autre'
}

export enum StatutAbsence {
  EN_ATTENTE = 'pending',
  APPROUVE = 'manager_approved',
  REJETE = 'rejected',
  ANNULE = 'cancelled',
}

@Entity('demandes_absences')
export class DemandeAbsence {
  @ApiProperty({ description: 'ID unique de la demande d’absence' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Type de la demande (congé, permission, etc.)', enum: TypeAbsence })
  @Column({
    type: 'enum',
    enum: TypeAbsence,
    default: TypeAbsence.CONGE,
  })
  type: TypeAbsence;

  @ApiProperty({ description: 'Date de début de la période d’absence' })
  @Column({ type: 'date' })
  dateDebut: Date;

  @ApiProperty({ description: 'Date de fin de la période d’absence' })
  @Column({ type: 'date' })
  dateFin: Date;

  @ApiProperty({ description: 'Raison ou motif de la demande' })
  @Column({ type: 'text', nullable: true })
  motif: string;

  @ApiProperty({ description: 'Statut actuel de la demande', enum: StatutAbsence })
  @Column({
    type: 'enum',
    enum: StatutAbsence,
    default: StatutAbsence.EN_ATTENTE,
  })
  statut: StatutAbsence;

  @ApiProperty({ description: 'Commentaire éventuel du validateur' })
  @Column({ type: 'text', nullable: true })
  motifRefus?: string;

  @ApiProperty({ type: () => User, description: 'Employé ayant soumis la demande' })
  @ManyToOne(() => User, (user) => user.id, { eager: true })
  @JoinColumn({ name: 'employe_id' })
  demandeBy: User;

  @ApiProperty({ type: () => User, description: 'Manager ayant traité la demande', required: false })
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: '' })
  ValidateBy?: User;


  @ApiProperty({ description: 'Date de création de la demande' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;
}
