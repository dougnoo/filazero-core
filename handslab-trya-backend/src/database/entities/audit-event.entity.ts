import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Tipos de eventos de auditoria suportados.
 * Sem dados sensíveis (CPF, nomes, endereços) - apenas IDs técnicos.
 */
export enum AuditEventType {
  /** Cadastro de nova operadora */
  OPERATOR_CREATED = 'OPERATOR_CREATED',
  /** Status da operadora alterado */
  OPERATOR_STATUS_CHANGED = 'OPERATOR_STATUS_CHANGED',
  /** Importação de rede credenciada iniciada */
  NETWORK_IMPORT_STARTED = 'NETWORK_IMPORT_STARTED',
  /** Importação de rede credenciada concluída */
  NETWORK_IMPORT_COMPLETED = 'NETWORK_IMPORT_COMPLETED',
  /** Importação de rede credenciada falhou */
  NETWORK_IMPORT_FAILED = 'NETWORK_IMPORT_FAILED',
  /** Operadora do tenant alterada */
  TENANT_OPERATOR_CHANGED = 'TENANT_OPERATOR_CHANGED',
  /** Tenant criado */
  TENANT_CREATED = 'TENANT_CREATED',
  /** Documento médico enviado */
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  /** Documento médico removido */
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
}

@Entity({ name: 'audit_events' })
@Index('idx_audit_events_type', ['eventType'])
@Index('idx_audit_events_entity', ['entityType', 'entityId'])
@Index('idx_audit_events_user', ['userId'])
@Index('idx_audit_events_created_at', ['createdAt'])
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType: AuditEventType;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 255 })
  entityId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255, nullable: true })
  userId?: string;

  /**
   * Payload do evento (JSON).
   * IMPORTANTE: Não armazenar dados sensíveis (CPF, nomes pessoais, endereços).
   * Apenas IDs técnicos, contadores e metadados.
   */
  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
