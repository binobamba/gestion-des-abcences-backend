import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandeAbsence, StatutAbsence } from './entities/demande-absence.entity';
import { CreateDemandeAbsenceDto } from './dto/create-demande-absence.dto';
import { UpdateDemandeAbsenceDto } from './dto/update-demande-absence.dto';
import { User, Role } from '../users/entities/user.entity';

@Injectable()
export class DemandeAbsenceService {
  constructor(
    @InjectRepository(DemandeAbsence)
    private readonly demandeRepository: Repository<DemandeAbsence>,
  ) {}

  async create(createDto: CreateDemandeAbsenceDto, user: User): Promise<DemandeAbsence> {
    const demande = this.demandeRepository.create({
      ...createDto,
      demandeBy: user,
    });
    return this.demandeRepository.save(demande);
  }

  async findAll(user: User): Promise<DemandeAbsence[]> {
    if ([Role.MANAGER, Role.RH, Role.DIRECTION].includes(user.role)) {
      return this.demandeRepository.find();
    }
    return this.demandeRepository.find({ where: { demandeBy: { id: user.id } } });
  }

  async findOne(id: number, user: User): Promise<DemandeAbsence> {
    const demande = await this.demandeRepository.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande #${id} non trouvée`);

    if (user.role === Role.EMPLOYE && demande.demandeBy.id !== user.id) {
      throw new ForbiddenException("Vous n'avez pas accès à cette demande");
    }
    return demande;
  }

  async update(id: number, updateDto: UpdateDemandeAbsenceDto, user: User): Promise<DemandeAbsence> {
    const demande = await this.findOne(id, user);

    if (updateDto.statut || updateDto.motifRefus || updateDto.validateById) {
      if (![Role.MANAGER, Role.RH, Role.DIRECTION].includes(user.role)) {
        throw new ForbiddenException("Vous n'avez pas le droit de modifier le statut");
      }
      if (updateDto.validateById) {
        demande.ValidateBy = { id: updateDto.validateById } as User;
      }
      if (updateDto.statut) demande.statut = updateDto.statut;
      if (updateDto.motifRefus) demande.motifRefus = updateDto.motifRefus;
    }

    if (user.role === Role.EMPLOYE && demande.demandeBy.id === user.id) {
      if (demande.statut !== StatutAbsence.EN_ATTENTE) {
        throw new ForbiddenException("Vous ne pouvez pas modifier une demande déjà traitée");
      }
      Object.assign(demande, updateDto);
    }

    return this.demandeRepository.save(demande);
  }

  async remove(id: number, user: User): Promise<void> {
    const demande = await this.findOne(id, user);

    if (user.role === Role.EMPLOYE && demande.demandeBy.id !== user.id) {
      throw new ForbiddenException("Vous ne pouvez annuler que vos propres demandes");
    }
    demande.statut = StatutAbsence.ANNULE
    await this.demandeRepository.save(demande);
  }
}
