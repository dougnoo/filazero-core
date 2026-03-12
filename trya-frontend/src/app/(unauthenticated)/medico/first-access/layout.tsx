import UnauthenticatedLayout from '@/layout/UnauthenticatedLayout';

export default function MedicoFirstAccessLayout({ children }: { children: React.ReactNode }) {
  return <UnauthenticatedLayout>{children}</UnauthenticatedLayout>;
}
