# Product Overview

This is the Trya Platform API - a healthcare platform administration system that manages users, companies, and modules, plus handles a medical consultation approval queue system.

## Core Features

- **AWS Cognito authentication** with JWT tokens
- **Role-based access control** (Super Admin, Admin, Doctor)
- **User management** - CRUD operations for platform users with different roles
- **Broker management** - CRUD operations for insurance brokers
- **Company management** - CRUD operations for companies (tenants/corretoras)
- **Module management** - CRUD operations for available features and capabilities
- **Medical consultation approval queue** - Doctors review patient consultations with AI-generated anamnesis summaries, uploaded medical exams, and session data
- **Queue filtering** - View pending, approved, and rejected consultations
- **Audit trail** - Track all approval decisions and entity changes

## User Roles

- `SUPER_ADMIN` - Super administrator with unrestricted access to all operations
- `ADMIN` - Platform administrator with full system access
- `DOCTOR` - Medical professional who reviews conversation summaries

## Core Workflows

### User Management

1. Super Admins and Admins can create and manage users
2. Users are assigned roles (SUPER_ADMIN, ADMIN, DOCTOR)
3. Each role has specific permissions and access levels
4. Doctors have additional profile information for medical credentials

### Platform Management

1. Super Admins and Admins manage brokers
2. Super Admins and Admins manage companies (corretoras)
3. Super Admins and Admins configure available modules
4. Companies can be associated with brokers

### Medical Consultation Approval Queue

1. Beneficiaries (patients) have conversations with AI chat system (external system)
2. AI asks questions about patient symptoms and concerns, gathering relevant information
3. AI generates conversation summary with initial analysis
4. Beneficiaries upload medical exams and documents
5. Consultation enters approval queue with:
   - AI-generated conversation summary and initial analysis
   - Uploaded medical exams
   - Session ID for tracking
   - Company (tenant_id) association
   - Beneficiary information
6. Doctors review complete consultation data in the queue
7. Doctors approve or reject consultations with optional notes
8. System tracks approval history and decisions with audit trail

## Key Entities

- **User** - Platform user with role (SUPER_ADMIN, ADMIN, DOCTOR)
- **Broker** - Insurance broker entity
- **Company (Tenant)** - Company/corretora that beneficiaries belong to
- **Module** - Configurable feature or capability
- **Approval Queue Item** - Patient consultation awaiting doctor review, containing:
  - AI-generated conversation summary and initial analysis
  - Medical exams uploaded by beneficiary
  - Session ID for tracking
  - Company (tenant_id) association
  - Beneficiary data
- **Approval Decision** - Doctor's approval/rejection with notes and timestamp
