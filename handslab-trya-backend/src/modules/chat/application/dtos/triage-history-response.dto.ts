import { ApiProperty } from '@nestjs/swagger';
import {
  TriageMessage,
  TriageSession,
} from '../../domain/entities/triage-session.entity';
import { SessionStatus } from '../../domain/value-objects/session-status.enum';

export class TriageHistoryItemDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  isComplete: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  messageCount: number;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ required: false })
  patientName?: string;

  @ApiProperty({ required: false })
  summary?: string;

  @ApiProperty({
    required: false,
    description: 'Primeira mensagem do usuário (sintoma inicial)',
  })
  firstUserMessage?: string;

  @ApiProperty({ required: false, description: 'Última mensagem da conversa' })
  lastMessage?: string;

  @ApiProperty({
    required: false,
    description: 'Sintomas relatados',
    type: [String],
  })
  symptoms?: string[];

  @ApiProperty({ required: false, description: 'Queixa principal' })
  chiefComplaint?: string;

  static fromEntity(entity: TriageSession): TriageHistoryItemDto {
    const dto = new TriageHistoryItemDto();
    dto.sessionId = entity.sessionId;
    dto.userId = entity.userId;
    dto.status = entity.status;
    dto.isComplete = entity.isComplete;
    dto.isActive = entity.isActive;
    dto.messageCount = entity.messageCount;
    dto.updatedAt = entity.updatedAt.toISOString();
    dto.patientName = entity.patientName;
    dto.summary = entity.summary;
    dto.symptoms = entity.symptoms;
    dto.chiefComplaint = entity.chiefComplaint;

    // Extrair primeira mensagem do usuário
    const firstUserMsg = entity.messages.find((m) => m.type === 'HumanMessage');
    if (firstUserMsg) {
      dto.firstUserMessage = firstUserMsg.content.substring(0, 100);
    }

    // Extrair última mensagem
    const lastMsg = entity.messages[entity.messages.length - 1];
    if (lastMsg) {
      dto.lastMessage = lastMsg.content.substring(0, 100);
    }

    return dto;
  }
}

export class TriageSessionDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [Object] })
  messages: any[];

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  isComplete: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  messageCount: number;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ required: false })
  patientName?: string;

  @ApiProperty({ required: false })
  doctorName?: string;

  @ApiProperty({ required: false })
  currentStage?: string;

  static fromEntity(entity: TriageSession): TriageSessionDto {
    const dto = new TriageSessionDto();
    dto.sessionId = entity.sessionId;
    dto.userId = entity.userId;
    dto.status = entity.status;
    dto.isComplete = entity.isComplete;
    dto.isActive = entity.isActive;
    dto.messageCount = entity.messageCount;
    dto.updatedAt = entity.updatedAt.toISOString();
    dto.patientName = entity.patientName;
    dto.doctorName = entity.doctorName;
    dto.currentStage = entity.currentStage;

    dto.messages = entity.messages.map((msg: TriageMessage) => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      attachments: msg.style === 'exam' ? entity.doctorAttachments : undefined,
      specialty:
        msg.style === 'searchMedicalService' ? entity.specialty : undefined,
      style: msg.style,
      phase: msg.phase,
      options: msg.options,
      hasSummaryPresentation: msg.hasSummaryPresentation,
      summaryPresentation:
        msg.style === 'summary' ? msg.summaryPresentation : undefined,
    }));

    return dto;
  }
}

export class TriageHistoryResponseDto {
  @ApiProperty({ type: [TriageHistoryItemDto] })
  items: TriageHistoryItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
