import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandeAbsence, StatutAbsence } from './entities/demande-absence.entity';
import { CreateDemandeAbsenceDto } from './dto/create-demande-absence.dto';
import { UpdateDemandeAbsenceDto } from './dto/update-demande-absence.dto';
import { User, Role } from '../users/entities/user.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { DirectionStatsDto, MonthlyTrendDto } from './dto/direction-stats.dto';


interface DirectionStats {
  totalEmployees: number;
  avgAbsenceRate: number;
  approvalRate: number;
  pendingRequests: number;
  totalRequests: number;
  averageDuration: number;
  mostCommonType: string;
  productivityRate: number;
}

interface MonthlyTrend {
  month: string;
  requests: number;
  rate: number;
}

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

  async getDashboardStats(user: User): Promise<DashboardStatsDto> {
    // Récupérer toutes les demandes de l'utilisateur
    const userDemandes = await this.demandeRepository.find({
      where: { demandeBy: { id: user.id } },
    });

    // Calculer les statistiques de base
    const totalRequests = userDemandes.length;
    const pendingRequests = userDemandes.filter(
      demande => demande.statut === StatutAbsence.EN_ATTENTE
    ).length;

    // Calculer les jours de congés (logique métier à adapter selon vos règles)
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Récupérer les demandes approuvées de l'année en cours
    const approvedDemandes = userDemandes.filter(demande => 
      (demande.statut === StatutAbsence.APPROUVE || demande.statut === StatutAbsence.EN_ATTENTE) &&
      demande.dateDebut >= yearStart &&
      demande.dateFin <= yearEnd
    );

    // Calculer le nombre total de jours de congés (à adapter selon votre politique)
    const totalDays = 25; // Exemple: 25 jours par an

    // Calculer les jours utilisés (congés approuvés)
    let usedDays = 0;
    approvedDemandes.forEach(demande => {
      if (demande.statut === StatutAbsence.APPROUVE) {
        const days = this.calculateWorkingDays(demande.dateDebut, demande.dateFin);
        usedDays += days;
      }
    });

    // Calculer les jours en attente
    let pendingDays = 0;
    const pendingDemandes = userDemandes.filter(
      demande => demande.statut === StatutAbsence.EN_ATTENTE
    );
    pendingDemandes.forEach(demande => {
      const days = this.calculateWorkingDays(demande.dateDebut, demande.dateFin);
      pendingDays += days;
    });

    const remainingDays = Math.max(0, totalDays - usedDays);

    // Pour les notifications (à intégrer avec votre système de notifications)
    const unreadNotifications = 0; // À remplacer par votre logique de notifications

    return {
      totalDays,
      usedDays,
      remainingDays,
      pendingDays,
      totalRequests,
      pendingRequests,
      unreadNotifications
    };
  }

  async getRecentRequests(user: User, limit: number = 5) {
    const requests = await this.demandeRepository.find({
      where: { demandeBy: { id: user.id } },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['demandeBy', 'ValidateBy'],
    });

    return requests.map(request => ({
      id: request.id,
      type: request.type,
      startDate: request.dateDebut,
      endDate: request.dateFin,
      duration: this.calculateWorkingDays(request.dateDebut, request.dateFin),
      status: request.statut,
      motif: request.motif,
      createdAt: request.createdAt,
    }));
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    // Implémentation simplifiée - à adapter selon vos règles métier
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) { // Exclure samedi et dimanche
        count++;
      }
    }
    
    return count;
  }

  async getDirectionStats(user: User): Promise<DirectionStatsDto> {

    console.log('\n \n \n=============================================>',user)

    // Vérifier les permissions
    if (![Role.DIRECTION, Role.RH].includes(user.role)) {
      throw new ForbiddenException("Accès non autorisé");
    }

    // Récupérer toutes les demandes
    const allDemandes = await this.demandeRepository.find({
      relations: ['demandeBy'],
    });

    // Récupérer tous les utilisateurs
    const userRepository = this.demandeRepository.manager.getRepository(User);
    const allUsers = await userRepository.find();
    const totalEmployees = allUsers.filter(u => [Role.EMPLOYE, Role.MANAGER].includes(u.role)).length;

    // Calculer les statistiques
    const totalRequests = allDemandes.length;
    const approvedRequests = allDemandes.filter(d => d.statut === StatutAbsence.APPROUVE).length;
    const pendingRequests = allDemandes.filter(d => d.statut === StatutAbsence.EN_ATTENTE).length;

    // Calculer la durée moyenne
    const totalDuration = allDemandes.reduce((sum, demande) => {
      return sum + this.calculateWorkingDays(demande.dateDebut, demande.dateFin);
    }, 0);
    const averageDuration = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;

    // Type le plus courant
    const typeCounts: Record<string, number> = allDemandes.reduce((acc, demande) => {
      acc[demande.type] = (acc[demande.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'conge'
    );

    // Taux d'absence moyen (simplifié)
    const totalWorkingDaysPerYear = 220; // Jours travaillés moyens par an
    const totalAbsenceDays = allDemandes
      .filter(d => d.statut === StatutAbsence.APPROUVE)
      .reduce((sum, demande) => sum + this.calculateWorkingDays(demande.dateDebut, demande.dateFin), 0);
    
    const avgAbsenceRate = totalEmployees > 0 ? 
      ((totalAbsenceDays / (totalEmployees * totalWorkingDaysPerYear)) * 100) : 0;

    const stats: DirectionStatsDto = {
      totalEmployees,
      avgAbsenceRate: parseFloat(avgAbsenceRate.toFixed(1)),
      approvalRate: approvedRequests,
      pendingRequests,
      totalRequests,
      averageDuration,
      mostCommonType: this.getTypeLabel(mostCommonType),
      productivityRate: parseFloat((100 - avgAbsenceRate).toFixed(1))
    };

    return stats;
  }

  async getMonthlyTrends(user: User): Promise<MonthlyTrendDto[]> {
    if (![Role.DIRECTION, Role.RH].includes(user.role)) {
      throw new ForbiddenException("Accès non autorisé");
    }

    const allDemandes = await this.demandeRepository.find();
    
    // Générer les 6 derniers mois
    const months: MonthlyTrendDto[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('fr-FR', { month: 'long' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthDemandes = allDemandes.filter(demande => {
        const demandeDate = new Date(demande.createdAt);
        return demandeDate.getFullYear() === year && demandeDate.getMonth() === month;
      });

      const totalWorkingDays = 22; // Jours travaillés moyens par mois
      const absenceDays = monthDemandes
        .filter(d => d.statut === StatutAbsence.APPROUVE)
        .reduce((sum, demande) => sum + this.calculateWorkingDays(demande.dateDebut, demande.dateFin), 0);
      
      const absenceRate = totalWorkingDays > 0 ? (absenceDays / totalWorkingDays) * 100 : 0;

      const trend: MonthlyTrendDto = {
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        requests: monthDemandes.length,
        rate: parseFloat(absenceRate.toFixed(1))
      };

      months.push(trend);
    }

    return months;
  }

  private getTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'conge': 'Congé',
      'permission': 'Permission',
      'maladie': 'Maladie',
      'accident_travail': 'Accident travail',
      'maternite': 'Maternité',
      'paternite': 'Paternité',
      'rtt': 'RTT',
      'formation': 'Formation',
      'teletravail': 'Télétravail',
      'autre': 'Autre'
    };
    return typeLabels[type] || type;
  }
}