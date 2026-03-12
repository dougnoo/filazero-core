import UnauthenticatedLayout from '@/layout/UnauthenticatedLayout';

export default function MedicoLoginLayout({ children }: { children: React.ReactNode }) {
  return <UnauthenticatedLayout>{children}</UnauthenticatedLayout>;
}
