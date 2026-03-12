export interface PrescriptionMedication {
  name: string;
  dosage: string;
  instructions: string;
  quantity: number;
}

export interface PrescriptionExam {
  name: string;
  instructions?: string;
}

export type SentVia = 'email' | 'sms' | 'whatsapp';

export interface PrescriptionProps {
  id: string;
  memedPrescriptionId: string; // ID da prescrição no Memed
  tenantId?: string; // Opcional
  doctorId: string;
  patientId: string;
  patientName: string;
  patientCpf?: string;
  sessionId?: string;
  medications: PrescriptionMedication[];
  exams: PrescriptionExam[];
  pdfUrl?: string;
  sentVia?: SentVia[];
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Prescription {
  private props: PrescriptionProps;

  constructor(props: PrescriptionProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.memedPrescriptionId) {
      throw new Error('Memed prescription ID is required');
    }

    if (!this.props.doctorId) {
      throw new Error('Doctor ID is required');
    }

    if (!this.props.patientId) {
      throw new Error('Patient ID is required');
    }

    if (!this.props.patientName || this.props.patientName.trim().length === 0) {
      throw new Error('Patient name is required');
    }

    // Note: medications and exams are optional - prescription can be created as reference first
    // The actual medication/exam data might be populated later or come from Memed API
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get memedPrescriptionId(): string {
    return this.props.memedPrescriptionId;
  }

  get tenantId(): string | undefined {
    return this.props.tenantId;
  }

  get doctorId(): string {
    return this.props.doctorId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get patientName(): string {
    return this.props.patientName;
  }

  get patientCpf(): string | undefined {
    return this.props.patientCpf;
  }

  get sessionId(): string | undefined {
    return this.props.sessionId;
  }

  get medications(): PrescriptionMedication[] {
    return this.props.medications;
  }

  get exams(): PrescriptionExam[] {
    return this.props.exams;
  }

  get pdfUrl(): string | undefined {
    return this.props.pdfUrl;
  }

  get sentVia(): SentVia[] | undefined {
    return this.props.sentVia;
  }

  get sentAt(): Date | undefined {
    return this.props.sentAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods
  setPdfUrl(url: string): void {
    this.props.pdfUrl = url;
    this.props.updatedAt = new Date();
  }

  markAsSent(via: SentVia[]): void {
    this.props.sentVia = via;
    this.props.sentAt = new Date();
    this.props.updatedAt = new Date();
  }

  addMedication(medication: PrescriptionMedication): void {
    this.props.medications.push(medication);
    this.props.updatedAt = new Date();
  }

  addExam(exam: PrescriptionExam): void {
    this.props.exams.push(exam);
    this.props.updatedAt = new Date();
  }

  isSent(): boolean {
    return !!this.props.sentAt;
  }

  hasPdf(): boolean {
    return !!this.props.pdfUrl;
  }

  toJSON(): PrescriptionProps {
    return { ...this.props };
  }
}
