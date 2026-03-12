import StaffLogin from '@/components/auth/StaffLogin';

export default function ManagerLogin() {
  return (
    <StaffLogin
      title="Área do Gestor"
      subtitle="Acesso para gestores de saúde"
      redirectTo="/gestor"
    />
  );
}
