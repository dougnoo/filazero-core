import PlatformAuthenticatedLayout from "@/layout/PlatformAuthenticatedLayout";

export default function PlatformAuthenticatedRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformAuthenticatedLayout>{children}</PlatformAuthenticatedLayout>;
}
