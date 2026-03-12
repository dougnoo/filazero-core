-- Migração: Atualizar nomes dos tenants para o formato normalizado (slug)
-- Data: 2025-12-18
-- Descrição: Os tenants devem usar slugs (grupotrigo, clinicasaude) ao invés de nomes formatados

BEGIN;

-- Atualizar Grupo Trigo para grupotrigo
UPDATE public.tenants 
SET "name" = 'grupotrigo'
WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid 
  AND "name" = 'Grupo Trigo';

-- Atualizar Clínica Saúde para clinicasaude (se existir)
UPDATE public.tenants 
SET "name" = 'clinicasaude'
WHERE id = '550e8400-e29b-41d4-a716-446655440001'::uuid 
  AND "name" = 'Clínica Saúde';

-- Atualizar Laboratório Vida para laboratoriovida (se existir)
UPDATE public.tenants 
SET "name" = 'laboratoriovida'
WHERE id = '550e8400-e29b-41d4-a716-446655440002'::uuid 
  AND "name" = 'Laboratório Vida';

-- Verificar os tenants atualizados
SELECT id, "name", active FROM public.tenants ORDER BY "name";

COMMIT;




