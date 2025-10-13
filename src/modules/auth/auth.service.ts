import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, motDePasse: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(motDePasse, user.motDePasse))) {
      const { motDePasse, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.motDePasse);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      nom: user.nom, 
      prenom: user.prenom 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        dateDeNaissance: user.dateDeNaissance,
        lieuDeNaissance: user.lieuDeNaissance,
        genre: user.genre,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(registerDto);
      const { motDePasse, ...result } = user;

      const payload = { 
        email: user.email, 
        sub: user.id, 
        nom: user.nom, 
        prenom: user.prenom 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    const { motDePasse, ...result } = user;
    return result;
  }
}