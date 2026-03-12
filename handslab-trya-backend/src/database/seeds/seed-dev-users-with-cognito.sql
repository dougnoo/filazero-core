-- ==============================================================================
-- Script de criação de usuários de desenvolvimento
-- Gerado automaticamente em 11/12/2025
-- 
-- IMPORTANTE: Execute primeiro o seed de tenants!
-- npm run seed:tenants
-- ==============================================================================

-- ==============================================================================
-- 1. Criar/Atualizar Tenants (caso ainda não existam)
-- ==============================================================================
INSERT INTO public.tenants (id, "name", active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Grupo Trigo', true, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Clínica Saúde', true, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Laboratório Vida', true, now(), now())
ON CONFLICT (name) DO UPDATE SET 
  id = EXCLUDED.id,
  active = EXCLUDED.active,
  updated_at = now();

-- ==============================================================================
-- 2. Criar usuários de desenvolvimento
-- ==============================================================================

-- ==================== SUPER ADMIN (Global) ====================
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Super Admin Dev',
  '00000000001',
  '1980-01-01',
  'superadmin.dev@trya.com',
  '+5511900000001',
  'SUPER_ADMIN',
  NULL, -- SUPER_ADMIN não tem tenant
  '94c85468-5071-7025-cfc3-0db584ad094a',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  updated_at = now();

-- ==================== GRUPO TRIGO ====================
-- Tenant ID: 550e8400-e29b-41d4-a716-446655440000

-- ADMIN - Grupo Trigo
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin Grupo Trigo',
  '00000000002',
  '1985-02-15',
  'admin.trigo@trya.com',
  '+5511900000002',
  'ADMIN',
  '550e8400-e29b-41d4-a716-446655440000',
  'd44884b8-70d1-7032-54ba-f783655ade75',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- DOCTOR - Grupo Trigo
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Dr. João Silva (Trigo)',
  '00000000003',
  '1975-03-20',
  'medico.trigo@trya.com',
  '+5511900000003',
  'DOCTOR',
  '550e8400-e29b-41d4-a716-446655440000',
  '0408c4d8-70c1-7062-a966-002fcff05447',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- HR - Grupo Trigo
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Maria RH Grupo Trigo',
  '00000000004',
  '1990-04-10',
  'rh.trigo@trya.com',
  '+5511900000004',
  'HR',
  '550e8400-e29b-41d4-a716-446655440000',
  'e4280418-9051-7026-f9d5-d86f4468cd83',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- BENEFICIARY - Grupo Trigo
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Ana Beneficiária Trigo',
  '00000000005',
  '1995-05-25',
  'beneficiario.trigo@trya.com',
  '+5511900000005',
  'BENEFICIARY',
  '550e8400-e29b-41d4-a716-446655440000',
  '44a87408-50a1-7009-2cb0-f88eff4c26d8',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- ==================== CLÍNICA SAÚDE ====================
-- Tenant ID: 550e8400-e29b-41d4-a716-446655440001

-- ADMIN - Clínica Saúde
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin Clínica Saúde',
  '00000000006',
  '1982-06-12',
  'admin.clinica@trya.com',
  '+5511900000006',
  'ADMIN',
  '550e8400-e29b-41d4-a716-446655440001',
  '440854b8-1001-7065-fe20-59557c6403c0',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- DOCTOR - Clínica Saúde
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Dra. Paula Santos (Clínica)',
  '00000000007',
  '1978-07-18',
  'medico.clinica@trya.com',
  '+5511900000007',
  'DOCTOR',
  '550e8400-e29b-41d4-a716-446655440001',
  'e4c884c8-0091-7078-afcf-74503398e1cd',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- HR - Clínica Saúde
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Carlos RH Clínica',
  '00000000008',
  '1988-08-22',
  'rh.clinica@trya.com',
  '+5511900000008',
  'HR',
  '550e8400-e29b-41d4-a716-446655440001',
  'a4982478-b001-700a-9824-600352176328',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- BENEFICIARY - Clínica Saúde
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Pedro Beneficiário Clínica',
  '00000000009',
  '1992-09-30',
  'beneficiario.clinica@trya.com',
  '+5511900000009',
  'BENEFICIARY',
  '550e8400-e29b-41d4-a716-446655440001',
  '44c824e8-30f1-7081-251a-d497de5f522e',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- ==================== LABORATÓRIO VIDA ====================
-- Tenant ID: 550e8400-e29b-41d4-a716-446655440002

-- ADMIN - Laboratório Vida
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin Laboratório Vida',
  '00000000010',
  '1984-10-05',
  'admin.lab@trya.com',
  '+5511900000010',
  'ADMIN',
  '550e8400-e29b-41d4-a716-446655440002',
  '54d83438-3091-7095-424e-0c3ce9930f22',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- DOCTOR - Laboratório Vida
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Dr. Roberto Lima (Lab)',
  '00000000011',
  '1970-11-15',
  'medico.lab@trya.com',
  '+5511900000011',
  'DOCTOR',
  '550e8400-e29b-41d4-a716-446655440002',
  '2418f4f8-f071-702a-862f-4c0e98329407',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- HR - Laboratório Vida
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Fernanda RH Lab',
  '00000000012',
  '1991-12-20',
  'rh.lab@trya.com',
  '+5511900000012',
  'HR',
  '550e8400-e29b-41d4-a716-446655440002',
  'c4680498-1081-707f-d93e-bf1d4b8d45a7',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- BENEFICIARY - Laboratório Vida
INSERT INTO public.users (id, name, cpf, birth_date, email, phone, type, tenant_id, cognito_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Lucas Beneficiário Lab',
  '00000000013',
  '1998-01-08',
  'beneficiario.lab@trya.com',
  '+5511900000013',
  'BENEFICIARY',
  '550e8400-e29b-41d4-a716-446655440002',
  '741814c8-e031-70ed-6a4d-01ffe0e2aa13',
  now(), now()
) ON CONFLICT (email) DO UPDATE SET
  cognito_id = EXCLUDED.cognito_id,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = now();

-- ==============================================================================
-- 3. Verificar usuários criados
-- ==============================================================================
SELECT 
  u.name,
  u.email,
  u.type,
  t.name as tenant_name,
  u.cognito_id
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.email LIKE '%@trya.com'
ORDER BY t.name, u.type;
