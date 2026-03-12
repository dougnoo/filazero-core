import UnauthenticatedLayout from '@/layout/UnauthenticatedLayout';

export default function PasswordResetLayout({ children }: { children: React.ReactNode }) {
  return <UnauthenticatedLayout>{children}</UnauthenticatedLayout>;
}

