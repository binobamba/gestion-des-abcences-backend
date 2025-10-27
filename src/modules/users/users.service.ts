import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DemandeAbsence, StatutAbsence, TypeAbsence } from 'src/modules/demande-absence/entities/demande-absence.entity';
import { StatistiquesDTO } from './dto/statistique.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
     @InjectRepository(DemandeAbsence)
    private readonly demandeAbsenceRepository: Repository<DemandeAbsence>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }
    const motDePasseHash = await bcrypt.hash(createUserDto.motDePasse, 12);
    const user = this.usersRepository.create({
      ...createUserDto,
      motDePasse: motDePasseHash,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'nom', 'prenom', 'dateDeNaissance', 'lieuDeNaissance', 'genre', 'createdAt', 'updatedAt']
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'email', 'nom', 'prenom', 'dateDeNaissance', 'lieuDeNaissance', 'genre', 'createdAt', 'updatedAt']
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email: email.toLowerCase() } 
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.motDePasse) {
      updateUserDto.motDePasse = await bcrypt.hash(updateUserDto.motDePasse, 12);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.update(id, updateUserDto);
  }

  async changePassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.update(id, {
      motDePasse: hashedPassword,
    });
  }

  async deactivateAccount(id: number): Promise<User> {
    const user = await this.findOne(id);
    return this.usersRepository.save(user);
  }

async getUserStats(): Promise<StatistiquesDTO & { averageDuration: number; mostCommonType: TypeAbsence }> {
    const total = await this.demandeAbsenceRepository.count();
    const approved = await this.demandeAbsenceRepository.count({ where: { statut: StatutAbsence.APPROUVE } });
    const pending = await this.demandeAbsenceRepository.count({ where: { statut: StatutAbsence.EN_ATTENTE } });
    const rejected = await this.demandeAbsenceRepository.count({ where: { statut: StatutAbsence.REJETE } });

    // Calcul de la durée moyenne
    const demandes = await this.demandeAbsenceRepository.find();
    const averageDuration =
      demandes.length > 0 ? demandes.reduce((sum, d) => sum + this.calculateDuration(d.dateDebut, d.dateFin), 0) / demandes.length : 0;

    const typeCount: Record<string, number> = {};
    demandes.forEach((d) => {
      typeCount[d.type] = (typeCount[d.type] || 0) + 1;
    });

    const mostCommonType =
      Object.keys(typeCount).length > 0
        ? Object.keys(typeCount).reduce((a, b) => (typeCount[a] > typeCount[b] ? a : b))
        : null;

    return {
      total,
      utilisee: approved,
      enAttent: pending,
      restant: rejected,
      averageDuration,
      mostCommonType: mostCommonType as TypeAbsence,
    };
  }

  private calculateDuration(start: Date, end: Date): number {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    return (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // inclut les deux jours
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.nom LIKE :query', { query: `%${query}%` })
      .orWhere('user.prenom LIKE :query', { query: `%${query}%` })
      .orWhere('user.email LIKE :query', { query: `%${query}%` })
      .select(['user.id', 'user.email', 'user.nom', 'user.prenom', 'user.genre'])
      .getMany();
  }

  async validateUser(email: string, motDePasse: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(motDePasse, user.motDePasse)) {
      return user;
    }
    return null;
  }
}