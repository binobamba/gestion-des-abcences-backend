import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query 
} from '@nestjs/common';
import { DemandeAbsenceService } from './demande-absence.service';
import { CreateDemandeAbsenceDto } from './dto/create-demande-absence.dto';
import { UpdateDemandeAbsenceDto } from './dto/update-demande-absence.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import local
import { DemandeAbsence } from './entities/demande-absence.entity';
import { User } from '../users/entities/user.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('demandes-absences')
@Controller('demandes-absences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DemandeAbsenceController {
  constructor(private readonly demandeAbsenceService: DemandeAbsenceService) {}

  @ApiOperation({ summary: "Créer une nouvelle demande d'absence" })
  @ApiResponse({ status: 201, description: 'Demande créée avec succès', type: DemandeAbsence })
  @Post()
  create(@Body() createDto: CreateDemandeAbsenceDto, @Request() req: { user: User }) {
    return this.demandeAbsenceService.create(createDto, req.user);
  }

  @ApiOperation({ summary: 'Récupérer toutes les demandes d\'absence' })
  @ApiResponse({ status: 200, description: 'Liste des demandes', type: [DemandeAbsence] })
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.demandeAbsenceService.findAll(req.user);
  }

  @ApiOperation({ summary: 'Récupérer une demande par ID' })
  @ApiResponse({ status: 200, description: 'Demande trouvée', type: DemandeAbsence })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.demandeAbsenceService.findOne(+id, req.user);
  }

  @ApiOperation({ summary: 'Mettre à jour une demande d\'absence' })
  @ApiResponse({ status: 200, description: 'Demande mise à jour', type: DemandeAbsence })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDemandeAbsenceDto,
    @Request() req: { user: User },
  ) {
    return this.demandeAbsenceService.update(+id, updateDto, req.user);
  }

  @ApiOperation({ summary: 'Supprimer une demande d\'absence' })
  @ApiResponse({ status: 200, description: 'Demande supprimée' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.demandeAbsenceService.remove(+id, req.user);
  }

  @ApiOperation({ summary: 'Récupérer les statistiques du dashboard' })
  @ApiResponse({ status: 200, description: 'Statistiques du dashboard', type: DashboardStatsDto })
  @Get('dashboard/stats')
  getDashboardStats(@Request() req: { user: User }) {
    return this.demandeAbsenceService.getDashboardStats(req.user);
  }

  @ApiOperation({ summary: 'Récupérer les demandes récentes pour le dashboard' })
  @ApiResponse({ status: 200, description: 'Liste des demandes récentes' })
  @Get('dashboard/recent-requests')
  getRecentRequests(
    @Request() req: { user: User },
    @Query('limit') limit: number = 5
  ) {
    return this.demandeAbsenceService.getRecentRequests(req.user, limit);
  }
}