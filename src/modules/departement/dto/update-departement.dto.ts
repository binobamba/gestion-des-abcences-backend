import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-departement.dto';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}