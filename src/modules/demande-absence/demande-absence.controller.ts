import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request 
} from '@nestjs/common';
import { DemandeAbsenceService } from './demande-absence.service';
import { CreateDemandeAbsenceDto } from './dto/create-demande-absence.dto';
import { UpdateDemandeAbsenceDto } from './dto/update-demande-absence.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { DemandeAbsence } from './entities/demande-absence.entity';
import { User } from 'src/modules/users/entities/user.entity';

@ApiTags('demandes-absences')
@Controller('demandes-absences')
export class DemandeAbsenceController {
  constructor(private readonly demandeAbsenceService: DemandeAbsenceService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer une nouvelle demande d'absence" })
  @ApiResponse({ status: 201, description: 'Demande créée avec succès', type: DemandeAbsence })
  @Post()
  create(@Body() createDto: CreateDemandeAbsenceDto, @Request() req: { user: User }) {
    const user = req.user
    return this.demandeAbsenceService.create(createDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer toutes les demandes d’absence' })
  @ApiResponse({ status: 200, description: 'Liste des demandes', type: [DemandeAbsence] })
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.demandeAbsenceService.findAll(req.user);
  }

 
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une demande par ID' })
  @ApiResponse({ status: 200, description: 'Demande trouvée', type: DemandeAbsence })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.demandeAbsenceService.findOne(+id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une demande d’absence' })
  @ApiResponse({ status: 200, description: 'Demande mise à jour', type: DemandeAbsence })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDemandeAbsenceDto,
    @Request() req: { user: User },
  ) {
    return this.demandeAbsenceService.update(+id, updateDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une demande d’absence' })
  @ApiResponse({ status: 200, description: 'Demande supprimée' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.demandeAbsenceService.remove(+id, req.user);
  }
}
