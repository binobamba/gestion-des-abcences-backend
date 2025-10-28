import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/departement.entity';
import { CreateDepartmentDto } from './dto/create-departement.dto';
import { UpdateDepartmentDto } from './dto/update-departement.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['manager', 'employees'],
    });
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['manager', 'employees'],
    });

    if (!department) {
      throw new NotFoundException(`Département #${id} non trouvé`);
    }

    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);
    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: number): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }

  async getDepartmentStats() {
    const departments = await this.findAll();
    
    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      employeesCount: dept.employees?.length || 0,
      managerName: dept.manager ? `${dept.manager.prenom} ${dept.manager.nom}` : 'Non assigné',
    }));
  }
}