import UnauthenticatedLayout from '@/layout/UnauthenticatedLayout';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <UnauthenticatedLayout>{children}</UnauthenticatedLayout>;
}

