import UnauthenticatedLayout from '@/layout/UnauthenticatedLayout';

export default function FirstAccessLayout({ children }: { children: React.ReactNode }) {
  return <UnauthenticatedLayout>{children}</UnauthenticatedLayout>;
}
