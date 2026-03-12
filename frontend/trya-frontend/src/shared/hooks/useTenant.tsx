"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';

function TenantProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  
  const tenant = useMemo(() => {
    return searchParams.get('tenant') || 'default';
  }, [searchParams]);
  
  const isMultiTenant = useMemo(() => {
    return tenant !== 'default';
  }, [tenant]);
  
  return (
    <div data-tenant={tenant} data-multi-tenant={isMultiTenant.toString()}>
      {children}
    </div>
  );
}

export function useTenant() {
  const searchParams = useSearchParams();
  
  const tenant = useMemo(() => {
    return searchParams.get('tenant') || 'default';
  }, [searchParams]);
  
  const isMultiTenant = useMemo(() => {
    return tenant !== 'default';
  }, [tenant]);
  
  return {
    tenant,
    isMultiTenant,
  };
}

export function TenantWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <TenantProvider>
        {children}
      </TenantProvider>
    </Suspense>
  );
}