import { Test, TestingModule } from '@nestjs/testing';
import { DemandeAbsenceController } from './demande-absence.controller';
import { DemandeAbsenceService } from './demande-absence.service';

describe('DemandeAbsenceController', () => {
  let controller: DemandeAbsenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandeAbsenceController],
      providers: [DemandeAbsenceService],
    }).compile();

    controller = module.get<DemandeAbsenceController>(DemandeAbsenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
