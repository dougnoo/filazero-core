import AuthenticatedLayout from "../../layout/AuthenticatedLayout";

export default function AuthenticatedRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}