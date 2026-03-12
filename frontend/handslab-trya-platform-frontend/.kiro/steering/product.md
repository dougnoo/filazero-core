# Product Overview

Trya is a multi-tenant healthcare platform that integrates AI-powered medical triage, telemedicine, and health benefits management. The system serves three primary user roles:

- **Patients (Paciente)**: Access AI-powered triage, view medical history, manage health documents, and connect with healthcare providers
- **HR Admins (Admin RH)**: Manage employee health beneficiaries, configure health plans, and customize tenant branding
- **Doctors (Médico)**: Review patient evaluations, validate AI triage results, and provide medical assessments

## Key Features

- **AI Triage System**: Interactive chat interface with multimodal input (text, audio, file attachments) for automated symptom assessment
- **Multi-tenant Architecture**: Each client (tenant) has customized branding, colors, logos, and themes. Default tenant is "Trigo"
- **Onboarding Flows**: Guided first-time user experience with location sharing, privacy acceptance, and health data collection
- **Health Management**: Patient medical history, clinical records, medication tracking, and allergy management
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes

## Tenant System

Tenants are identified via:
- Query parameter: `?tenant=client-name`
- Subdomain: `client.trya.com`
- Default: "trigo" (when no tenant specified)

Each tenant has customizable colors, typography, logos, and layout preferences defined in `themeService.ts`.
