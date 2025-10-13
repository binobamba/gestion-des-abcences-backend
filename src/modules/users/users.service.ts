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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    // Hasher le mot de passe
    const motDePasseHash = await bcrypt.hash(createUserDto.motDePasse, 12);

    // Créer l'utilisateur
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

    // Si le mot de passe est modifié, le hasher
    if (updateUserDto.motDePasse) {
      updateUserDto.motDePasse = await bcrypt.hash(updateUserDto.motDePasse, 12);
    }

    // Mettre à jour l'utilisateur
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
    // Vous pouvez ajouter un champ 'estActif' dans votre entité si besoin
    return this.usersRepository.save(user);
  }

  async getUserStats(): Promise<{ total: number }> {
    const total = await this.usersRepository.count();
    return { total };
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