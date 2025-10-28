import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentsService } from './departement.service';
import { CreateDepartmentDto } from './dto/create-departement.dto';
import { UpdateDepartmentDto } from './dto/update-departement.dto';
import { Department } from './entities/departement.entity';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';

@ApiTags('departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un département' })
  @ApiResponse({ status: 201, description: 'Département créé', type: Department })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les départements' })
  @ApiResponse({ status: 200, description: 'Liste des départements', type: [Department] })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des départements' })
  @ApiResponse({ status: 200, description: 'Statistiques des départements' })
  getStats() {
    return this.departmentsService.getDepartmentStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un département par ID' })
  @ApiResponse({ status: 200, description: 'Département trouvé', type: Department })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un département' })
  @ApiResponse({ status: 200, description: 'Département mis à jour', type: Department })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(+id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un département' })
  @ApiResponse({ status: 200, description: 'Département supprimé' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}