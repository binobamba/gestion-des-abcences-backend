export class Departement {}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('departments')
export class Department {
  @ApiProperty({ description: 'ID unique du département' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nom du département' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Description du département' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Code du département' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: 'Budget annuel du département' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @ApiProperty({ type: () => User, description: 'Manager du département' })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ApiProperty({ type: () => User, description: 'Employés du département' })
  @OneToMany(() => User, (user) => user.department)
  employees: User[];

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;
}