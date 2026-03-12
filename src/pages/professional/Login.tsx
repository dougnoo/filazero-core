import StaffLogin from '@/components/auth/StaffLogin';
import { UserRole } from '@/domain/enums/user-role';

export default function ProfessionalLogin() {
  return (
    <StaffLogin
      title="Área Profissional"
      subtitle="Acesso para profissionais de saúde"
      redirectTo="/profissional"
      role={UserRole.PROFESSIONAL}
    />
  );
}
