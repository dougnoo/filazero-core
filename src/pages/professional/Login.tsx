import StaffLogin from '@/components/auth/StaffLogin';

export default function ProfessionalLogin() {
  return (
    <StaffLogin
      title="Área Profissional"
      subtitle="Acesso para profissionais de saúde"
      redirectTo="/profissional"
    />
  );
}
