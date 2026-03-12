import { Test, TestingModule } from '@nestjs/testing';
import { GenerateHealthAlertsUseCase } from './generate-health-alerts.use-case';
import { User } from '../../../../database/entities/user.entity';
import { MedicalDocument, MedicalDocumentType } from '../../../../database/entities/medical-document.entity';
import { TimelineService } from '../services/timeline.service';
import {
  DOCUMENT_EXPIRING_RULE_TOKEN,
  DOCUMENT_EXPIRED_RULE_TOKEN,
} from '../../domain/alerts/alert-rule.interface';
import { DocumentExpiringRule } from '../../domain/alerts/document-expiring.rule';
import { DocumentExpiredRule } from '../../domain/alerts/document-expired.rule';
import {
  HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN,
  IHealthAlertSourceRepository,
} from '../../domain/health-alert-source.repository.interface';
import { ALERT_DEDUPLICATION_POLICY_TOKEN } from '../policies/alert-deduplication.policy';
import type { IAlertDeduplicationPolicy } from '../policies/alert-deduplication.policy';

describe('GenerateHealthAlertsUseCase', () => {
  let useCase: GenerateHealthAlertsUseCase;
  let healthAlertSourceRepository: jest.Mocked<IHealthAlertSourceRepository>;
  let deduplicationPolicy: jest.Mocked<IAlertDeduplicationPolicy>;
  let timelineService: TimelineService;

  const mockTenant = { id: 'tenant-1' };
  const mockOwner = {
    id: 'owner-1',
    name: 'John Doe',
    tenantId: 'tenant-1',
    subscriberId: null,
    dependents: [],
  } as unknown as User;

  const mockMember = {
    id: 'member-1',
    name: 'Jane Doe',
    tenantId: 'tenant-1',
    subscriberId: 'owner-1',
  } as unknown as User;

  const mockDocumentExpiring = {
    id: 'doc-1',
    tenantId: 'tenant-1',
    ownerUserId: 'owner-1',
    memberUserId: 'member-1',
    documentType: MedicalDocumentType.LAB_EXAM,
    category: 'Hemograma',
    title: 'Hemograma Completo',
    issueDate: new Date('2024-01-01'),
    validUntil: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  } as MedicalDocument;

  const mockDocumentExpired = {
    id: 'doc-2',
    tenantId: 'tenant-1',
    ownerUserId: 'owner-1',
    memberUserId: 'member-1',
    documentType: MedicalDocumentType.VACCINATION,
    category: 'Vacinação Gripe',
    title: 'Vacinação Gripe',
    issueDate: new Date('2023-01-01'),
    validUntil: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  } as MedicalDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateHealthAlertsUseCase,
        {
          provide: HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN,
          useValue: {
            findTenants: jest.fn(),
            findPrimaryUsers: jest.fn(),
            findFamilyDocuments: jest.fn(),
            hasRecentAlert: jest.fn(),
          },
        },
        {
          provide: TimelineService,
          useValue: {
            registerAlert: jest.fn(),
          },
        },
        {
          provide: ALERT_DEDUPLICATION_POLICY_TOKEN,
          useValue: {
            getSinceDate: jest.fn(() => {
              const since = new Date();
              since.setHours(since.getHours() - 24);
              return since;
            }),
          },
        },
        {
          provide: DOCUMENT_EXPIRING_RULE_TOKEN,
          useClass: DocumentExpiringRule,
        },
        {
          provide: DOCUMENT_EXPIRED_RULE_TOKEN,
          useClass: DocumentExpiredRule,
        },
      ],
    }).compile();

    useCase = module.get<GenerateHealthAlertsUseCase>(GenerateHealthAlertsUseCase);
    healthAlertSourceRepository = module.get(
      HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN,
    );
    deduplicationPolicy = module.get(ALERT_DEDUPLICATION_POLICY_TOKEN);
    timelineService = module.get<TimelineService>(TimelineService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should process all tenants when tenantId is not provided', async () => {
      healthAlertSourceRepository.findTenants.mockResolvedValue([mockTenant]);
      healthAlertSourceRepository.findPrimaryUsers.mockResolvedValue([mockOwner]);
      healthAlertSourceRepository.findFamilyDocuments.mockResolvedValue([mockDocumentExpiring]);
      healthAlertSourceRepository.hasRecentAlert.mockResolvedValue(false);

      await useCase.execute();

      expect(healthAlertSourceRepository.findTenants).toHaveBeenCalled();
    });

    it('should generate alert for expiring document', async () => {
      healthAlertSourceRepository.findTenants.mockResolvedValue([mockTenant]);
      healthAlertSourceRepository.findPrimaryUsers.mockResolvedValue([
        { ...mockOwner, dependents: [mockMember] } as unknown as User,
      ]);
      healthAlertSourceRepository.findFamilyDocuments.mockResolvedValue([mockDocumentExpiring]);
      healthAlertSourceRepository.hasRecentAlert.mockResolvedValue(false);

      await useCase.execute({ tenantId: 'tenant-1' });

      expect(timelineService.registerAlert).toHaveBeenCalled();
    });

    it('should not create duplicate alerts within 24 hours', async () => {
      healthAlertSourceRepository.findTenants.mockResolvedValue([mockTenant]);
      healthAlertSourceRepository.findPrimaryUsers.mockResolvedValue([
        { ...mockOwner, dependents: [mockMember] } as unknown as User,
      ]);
      healthAlertSourceRepository.findFamilyDocuments.mockResolvedValue([mockDocumentExpiring]);
      healthAlertSourceRepository.hasRecentAlert.mockResolvedValue(true);

      await useCase.execute({ tenantId: 'tenant-1' });

      expect(deduplicationPolicy.getSinceDate).toHaveBeenCalled();
      expect(timelineService.registerAlert).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      healthAlertSourceRepository.findTenants.mockRejectedValue(new Error('DB Error'));

      await expect(useCase.execute()).rejects.toThrow('DB Error');
    });
  });

  describe('DocumentExpiringRule', () => {
    it('should detect documents expiring within 15 days', async () => {
      const rule = new DocumentExpiringRule();
      const canGenerate = await rule.canGenerate(mockMember, [mockDocumentExpiring]);

      expect(canGenerate).toBe(true);
    });

    it('should not alert for already-expired documents', async () => {
      const rule = new DocumentExpiringRule();
      const canGenerate = await rule.canGenerate(mockMember, [mockDocumentExpired]);

      expect(canGenerate).toBe(false);
    });

    it('should generate humanized alert message', async () => {
      const rule = new DocumentExpiringRule();
      const alert = await rule.generateAlert(mockMember, [mockDocumentExpiring]);

      expect(alert).toBeDefined();
      expect(alert?.message).toContain(mockMember.name.split(' ')[0]);
      expect(alert?.priority).toBeDefined();
    });
  });

  describe('DocumentExpiredRule', () => {
    it('should detect already-expired documents', async () => {
      const rule = new DocumentExpiredRule();
      const canGenerate = await rule.canGenerate(mockMember, [mockDocumentExpired]);

      expect(canGenerate).toBe(true);
    });

    it('should not alert for non-expired documents', async () => {
      const rule = new DocumentExpiredRule();
      const canGenerate = await rule.canGenerate(mockMember, [mockDocumentExpiring]);

      expect(canGenerate).toBe(false);
    });
  });
});
