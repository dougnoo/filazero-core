"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import DynamicSVG from "@/shared/components/DynamicSVG";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { useUserProfile } from "@/shared/context/UserProfileContext";

const createIcon = (paths: string[]) => (
  <DynamicSVG width="28" height="28" viewBox="0 0 28 28">
    {paths.map((path, index) => (
      <path 
        key={index}
        d={path} 
        stroke="currentColor" 
        strokeWidth="1.16667" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    ))}
  </DynamicSVG>
);

const TriagemIcon = () => createIcon([
  "M19.0312 10.0868C19.0313 10.9764 19.3846 11.8296 20.0137 12.4586C20.6427 13.0876 21.4958 13.441 22.3854 13.441C23.275 13.441 24.1281 13.0876 24.7572 12.4586C25.3862 11.8296 25.7396 10.9764 25.7396 10.0868C25.7396 9.19725 25.3862 8.34411 24.7572 7.71508C24.1281 7.08605 23.275 6.73267 22.3854 6.73267C21.4958 6.73267 20.6427 7.08605 20.0137 7.71508C19.3846 8.34411 19.0313 9.19725 19.0312 10.0868Z",
  "M5.6146 2.2605C4.72502 2.2605 3.87188 2.61388 3.24285 3.24291C2.61382 3.87194 2.26044 4.72508 2.26044 5.61466V10.0869C2.26044 11.5695 2.84941 12.9914 3.89779 14.0398C4.94617 15.0882 6.36808 15.6772 7.85071 15.6772C9.33335 15.6772 10.7553 15.0882 11.8036 14.0398C12.852 12.9914 13.441 11.5695 13.441 10.0869V5.61466C13.441 4.72508 13.0876 3.87194 12.4586 3.24291C11.8296 2.61388 10.9764 2.2605 10.0868 2.2605",
  "M7.85065 15.677V24.6215C7.85065 25.2145 8.08624 25.7833 8.50559 26.2026C8.92494 26.622 9.4937 26.8576 10.0868 26.8576C10.6798 26.8576 11.2486 26.622 11.6679 26.2026C12.0873 25.7833 12.3229 25.2145 12.3229 24.6215V18.1725C12.3229 17.4312 12.6174 16.7203 13.1415 16.1961C13.6657 15.6719 14.3767 15.3774 15.118 15.3774C15.8593 15.3774 16.5703 15.6719 17.0945 16.1961C17.6187 16.7203 17.9131 17.4312 17.9131 18.1725V22.3854C17.9131 22.9784 18.1487 23.5472 18.5681 23.9665C18.9874 24.3859 19.5562 24.6215 20.1493 24.6215C20.7423 24.6215 21.3111 24.3859 21.7304 23.9665C22.1498 23.5472 22.3854 22.9784 22.3854 22.3854V13.4409",
  "M5.61456 1.14258V3.93772",
  "M10.0869 1.14258V3.93772"
]);

const RedeCredenciadaIcon = () => createIcon([
  "M22.9429 10.025C22.9429 14.9733 14.0001 26.9169 14.0001 26.9169C14.0001 26.9169 5.05731 14.9733 5.05731 10.025C5.05731 7.65327 5.99949 5.37864 7.67658 3.70155C9.35368 2.02445 11.6283 1.08228 14.0001 1.08228C16.3718 1.08228 18.6465 2.02445 20.3236 3.70155C22.0007 5.37864 22.9429 7.65327 22.9429 10.025Z",
  "M11.4996 13.9991V6.49731M16.5007 6.49731V13.9991M11.4996 9.9356H16.5007"
]);

const AtestadosIcon = () => createIcon([
  "M26.7443 15.5441V21.0882C26.7443 21.6296 26.3054 22.0685 25.7639 22.0685H2.23636C1.69494 22.0685 1.25604 21.6296 1.25604 21.0882V5.40317C1.25604 4.86176 1.69494 4.42285 2.23636 4.42285H6.68452",
  "M12.0396 22.0688L10.079 26.9704",
  "M15.9608 22.0688L17.9214 26.9704",
  "M8.11823 26.9702H19.882",
  "M16.8639 1.17139H17.9616C18.2528 1.17139 18.532 1.28705 18.7379 1.49292C18.9437 1.69879 19.0594 1.97802 19.0594 2.26916V5.27978C19.0594 6.44437 18.5967 7.56126 17.7733 8.38475C16.9498 9.20824 15.8329 9.67087 14.6683 9.67087C13.5038 9.67087 12.3868 9.20824 11.5633 8.38475C10.7399 7.56126 10.2772 6.44437 10.2772 5.27978V2.26916C10.2772 1.97802 10.3929 1.69879 10.5988 1.49292C10.8046 1.28705 11.0839 1.17139 11.375 1.17139H12.4728",
  "M24.5485 7.47532C25.761 7.47532 26.744 6.49234 26.744 5.27978C26.744 4.06722 25.761 3.08423 24.5485 3.08423C23.3358 3.08423 22.3529 4.06722 22.3529 5.27978C22.3529 6.49234 23.3358 7.47532 24.5485 7.47532Z",
  "M14.6682 9.67064V10.2195C14.6682 11.5297 15.1887 12.7862 16.115 13.7126C17.0414 14.6391 18.2979 15.1595 19.6081 15.1595C20.9183 15.1595 22.1748 14.6391 23.1012 13.7126C24.0277 12.7862 24.5481 11.5297 24.5481 10.2195V7.4751"
]);

const PerguntasFrequentesIcon = () => createIcon([
  "M16.1636 12.7819C16.7403 12.2369 17.5069 11.9381 18.3005 11.9493C19.0939 11.9604 19.8518 12.2806 20.413 12.8418C20.9741 13.4028 21.2943 14.1608 21.3055 14.9543C21.3167 15.7478 21.0179 16.5143 20.4727 17.0911L16.8002 20.7636C16.2267 21.3126 15.4616 21.6162 14.6677 21.6097C13.8739 21.6033 13.1138 21.2874 12.5493 20.7293C11.9847 20.171 11.6602 19.4147 11.6448 18.6209C11.6294 17.8272 11.9242 17.0587 12.4666 16.479L16.1636 12.7819Z",
  "M14.4991 14.4475L18.8082 18.7566",
  "M9.68594 13.3277C11.788 13.3277 13.4919 11.6237 13.4919 9.52177C13.4919 7.41979 11.788 5.71582 9.68594 5.71582C7.58398 5.71582 5.88 7.41979 5.88 9.52177C5.88 11.6237 7.58398 13.3277 9.68594 13.3277Z",
  "M5.88 9.52197H13.4919",
  "M13.023 24.7436C19.4959 24.7436 24.7432 19.4962 24.7432 13.0232C24.7432 6.55033 19.4959 1.30298 13.023 1.30298C6.55002 1.30298 1.30267 6.55033 1.30267 13.0232C1.30267 19.4962 6.55002 24.7436 13.023 24.7436Z",
  "M21.3058 21.3049L26.6971 26.6962"
]);

const DocumentosIcon = () => createIcon([
  "M22.1667 26.25H5.83333C5.21449 26.25 4.62098 26.0041 4.18315 25.5669C3.74531 25.1296 3.5 24.5368 3.5 23.9167V4.08333C3.5 3.46449 3.74531 2.87098 4.18315 2.43315C4.62098 1.99531 5.21449 1.75 5.83333 1.75H15.1667L24.5 11.0833V23.9167C24.5 24.5368 24.2547 25.1296 23.8169 25.5669C23.379 26.0041 22.7855 26.25 22.1667 26.25Z",
  "M15.1667 1.75V11.0833H24.5",
  "M17.5 15.75H10.5",
  "M17.5 20.4167H10.5",
  "M12.8333 11.0833H10.5"
]);

const GestaoFamiliarIcon = () => createIcon([
  "M13.5 18.5C16.2614 18.5 18.5 16.2614 18.5 13.5C18.5 10.7386 16.2614 8.5 13.5 8.5C10.7386 8.5 8.5 10.7386 8.5 13.5C8.5 16.2614 10.7386 18.5 13.5 18.5Z",
"M4.95996 26.3C5.85244 24.835 7.10678 23.6242 8.60238 22.7841C10.098 21.944 11.7845 21.5027 13.5 21.5027C15.2154 21.5027 16.902 21.944 18.3975 22.7841C19.8931 23.6242 21.1475 24.835 22.04 26.3",
"M26.5 13.38C26.5019 13.1024 26.446 12.8274 26.3358 12.5726C26.2256 12.3178 26.0636 12.0888 25.86 11.9L13.5 0.5L1.14005 11.9C0.936495 12.0888 0.774471 12.3178 0.664286 12.5726C0.554101 12.8274 0.498167 13.1024 0.500046 13.38V24.5C0.500046 25.0304 0.71076 25.5391 1.08583 25.9142C1.46091 26.2893 1.96961 26.5 2.50005 26.5H24.5C25.0305 26.5 25.5392 26.2893 25.9143 25.9142C26.2893 25.5391 26.5 25.0304 26.5 24.5V13.38Z"
]);

const SaudeMentalIcon = () => createIcon([
  "M9.02132 27.3333V23.8333H7.72632C6.79806 23.8333 5.90782 23.4646 5.25144 22.8082C4.59507 22.1518 4.22632 21.2616 4.22632 20.3333V16.8333H1.08798C0.994622 16.8329 0.902676 16.8105 0.81958 16.7679C0.736483 16.7254 0.664568 16.6638 0.60965 16.5883C0.55644 16.5153 0.521296 16.4307 0.5071 16.3415C0.492904 16.2523 0.500061 16.1609 0.527984 16.075C2.94298 8.58501 4.62298 0.500008 13.9796 0.500008C16.3788 0.49718 18.7173 1.25379 20.6602 2.66145C22.603 4.0691 24.0504 6.05556 24.7951 8.33625C25.5398 10.6169 25.5435 13.0748 24.8057 15.3577C24.068 17.6406 22.6265 19.6315 20.688 21.045V27.3333",
  "M20.6528 8.25794C20.5523 7.40214 20.1397 6.61349 19.4938 6.04303C18.848 5.47257 18.0145 5.16039 17.1528 5.16627C16.6226 5.16949 16.1 5.29316 15.6245 5.52794C15.3639 5.05304 14.9758 4.66045 14.5039 4.3945C14.032 4.12856 13.4952 3.99984 12.954 4.0229C12.4128 4.04595 11.8889 4.21986 11.4413 4.52498C10.9937 4.83009 10.6404 5.25427 10.4212 5.7496C10.0381 5.73428 9.65585 5.79455 9.29612 5.92697C8.93639 6.0594 8.60627 6.26138 8.3246 6.52138C8.04293 6.78138 7.81523 7.09432 7.65449 7.44232C7.49376 7.79033 7.40315 8.16658 7.38783 8.5496C7.37251 8.93263 7.43278 9.31492 7.5652 9.67464C7.69762 10.0344 7.8996 10.3645 8.15961 10.6462C8.41961 10.9278 8.73255 11.1555 9.08055 11.3163C9.42856 11.477 9.80481 11.5676 10.1878 11.5829C10.5055 11.5771 10.8204 11.522 11.1212 11.4196C11.4283 12.0421 11.9176 12.5563 12.524 12.8939C13.1305 13.2315 13.8253 13.3765 14.5162 13.3096C14.7643 14.1417 15.2691 14.8741 15.9585 15.4021C16.6478 15.9302 17.4865 16.2268 18.3545 16.2496C19.4758 16.2101 20.5357 15.7271 21.3013 14.9069C22.0668 14.0866 22.4756 12.996 22.4378 11.8746C22.4475 11.1736 22.2907 10.4802 21.9804 9.85153C21.6701 9.22283 21.2151 8.67669 20.6528 8.25794Z",
  "M11.1213 11.4199L11.4597 10.4166C11.7248 9.62252 12.273 8.95388 12.9997 8.53825L13.688 8.08325",
  "M20.198 6.91675C17.7363 7.53508 17.3747 8.74841 17.188 9.25008",
  "M20.1514 15.8069C19.9221 14.5927 19.3086 13.4843 18.4014 12.6453"
]);

type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  status?: string;
  action: string;
  footnote?: string;
  route?: string;
  restrictedForDependents?: boolean;
};

export function ServicesGrid() {
  const router = useRouter();
  const { tenant } = useTenantAssets();
  const { isDependent } = useUserProfile();

  const services: Service[] = [
    {
      title: "Triagem de sintomas",
      description: "Descubra o melhor caminho para seu cuidado em poucos minutos.",
      icon: TriagemIcon(),
      features: ["Relate seus sintomas de forma simples", "Orientação imediata com apoio de IA", "Encaminhamento médico quando necessário"],
      status: "Atendimento disponível agora",
      action: "Iniciar triagem",
      route: "/paciente/triagem",
    },
    {
      title: "Rede credenciada",
      description: "Encontre profissionais e serviços de saúde perto de você.",
      icon: RedeCredenciadaIcon(),
      features: ["Médicos especialistas por área", "Clínicas e hospitais conveniados", "Atendimento conforme seu plano"],
      action: "Buscar atendimento",
      footnote: "500+ opções de atendimento",
      route: "/paciente/rede-credenciada",
    },
    {
      title: "Atestados",
      description: "Envie, valide e acompanhe seus atestados em um só lugar.",
      icon: AtestadosIcon(),
      features: ["Envio rápido do documento", "Conferência automatizada", "Informação organizada para conferência"],
      status: "Pronto para uso",
      action: "Enviar atestado",
      route: "/paciente/atestados",
      restrictedForDependents: true,
    },
    {
      title: "Dúvidas frequentes",
      description: "Entenda como a Trya funciona e como seus dados são cuidados.",
      icon: PerguntasFrequentesIcon(),
      features: [
        "Como funciona a triagem de sintomas",
        "Uso responsável da inteligência artificial",
        "Segurança e privacidade das informações",
      ],
      status: "Conteúdo disponível",
      action: "Ver dúvidas",
      route: "/paciente/faq",
      restrictedForDependents: true,
    },
    {
      title: "Saúde mental",
      description: "Cuidado emocional com profissionais qualificados, de forma simples e segura.",
      icon: SaudeMentalIcon(),
      features: [
        "Psicólogos e psiquiatras especializados",
        "Atendimento com total privacidade",
        "Apoio para ansiedade, estresse e crises",
      ],
      status: "Em breve",
      action: "Iniciar atendimento",
      // route: "/paciente/documentos",
      restrictedForDependents: true,
    },
    {
      title: "Gestão Familiar",
      description: "Organize e acompanhe a saúde da sua família em um só lugar.",
      icon: GestaoFamiliarIcon(),
      features: [
        "Histórico médico centralizado",
        "Controle de consultas e exames",
        "Consulta de vacinação digital",
      ],
      status: "Sempre disponível",
      action: "Gerenciar família",
      route: "/paciente/gestao-familiar",
      restrictedForDependents: true,
    },
  ];

  // Filtra serviços baseado no role do usuário
  const availableServices = isDependent
    ? services.filter((s) => !s.restrictedForDependents)
    : services;

  const handleNavigate = (route?: string) => {
    if (route) {
      const urlWithTenant = getUrlWithTenant(route, tenant);
      router.push(urlWithTenant);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: { xs: "16px", sm: "12px", md: "16px" }
      }}>
        {availableServices.map((s, i) => {
          const serviceId = s.title.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[àáâã]/g, "a")
            .replace(/[ç]/g, "c") + "-service";
          
          return (
          <Card
            key={i}
            id={serviceId}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", md: "1 1 calc(50% - 12px)" },
              borderRadius: { xs: "16px", md: "16px" },
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
              border: `1px solid`,
              borderColor: 'divider',
              overflow: "hidden",
              fontFamily: "Chivo, sans-serif",
              minHeight: { xs: "auto", md: "280px" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                backgroundColor: (theme) => tenant ==='grupotrigo'?  theme.palette.secondary.main : theme.palette.secondary.main + '4D',
                px: { xs: "16px", md: "20px" },
                py: { xs: "16px", md: "18px" },
                display: "flex",
                alignItems: "center",
                gap: "14px",
                borderBottom: `2px solid`,
                borderColor: tenant ==='grupotrigo'?  'primary.main' : 'secondary.main',
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, md: 56 },
                  height: { xs: 48, md: 56 },
                  borderRadius: "9999px",
                  backgroundColor: tenant === 'grupotrigo' ? 'primary.main' : 'secondary.main',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  "& svg": { 
                    width: { xs: 24, md: 28 }, 
                    height: { xs: 24, md: 28 },
                    color: 'primary.contrastText',
                  },
                }}
              >
                {s.icon}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h3"
                  sx={{
                    fontSize: { xs: "16px", md: "18px" },
                    lineHeight: { xs: "22px", md: "26px" },
                    letterSpacing: "-0.3px",
                    fontWeight: 700,
                  }}
                >
                  {s.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "12px", md: "13px" },
                    lineHeight: { xs: "16px", md: "18px" },
                    fontWeight: 400,
                    color: 'grey.800',
                  }}
                >
                  {s.description}
                </Typography>
              </Box>
            </Box>

            <CardContent 
              sx={{ 
                px: { xs: "16px", md: "20px" }, 
                py: { xs: "16px", md: "20px" },
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
               <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "8px", md: "10px" }, mb: { xs: 2, md: 3 }, flex: 1 }}>
                 {s.features.map((f, idx) => (
                   <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                     <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: 'primary.main', mt: "6px", flexShrink: 0 }} />
                     <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, lineHeight: { xs: "18px", md: "20px" }, color: 'grey.800' }}>
                       {f}
                     </Typography>
                   </Box>
                 ))}
               </Box>

               <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: { xs: 1, md: 2 } }}>
                {s.status ? (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#BCDF84" }} />
                    <Typography sx={{ fontSize: { xs: "11px", md: "12px" }, lineHeight: "16px", color: 'grey.800' }}>
                      {s.status}
                    </Typography>
                  </Box>
                ) : s.footnote ? (
                  <Typography sx={{ fontSize: { xs: "11px", md: "12px" }, lineHeight: "16px", color: 'grey.800' }}>
                    {s.footnote}
                  </Typography>
                ) : <span />}

                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  disableElevation
                  onClick={() => handleNavigate(s.route)}
                >
                  {s.action}
                </Button>
              </Box>
            </CardContent>
          </Card>
          );
        })}
      </Box>
    </Box>
  );
}

