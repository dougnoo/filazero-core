import StaffLogin from '@/components/auth/StaffLogin';
import { UserRole } from '@/domain/enums/user-role';

export default function ManagerLogin() {
  return (
    <StaffLogin
      title="Área do Gestor"
      subtitle="Acesso para gestores de saúde"
      redirectTo="/gestor"
      role={UserRole.MANAGER}
    />
  );
}
