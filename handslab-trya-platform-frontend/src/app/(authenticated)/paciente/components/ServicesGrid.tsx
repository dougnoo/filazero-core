"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import DynamicSVG from "@/shared/components/DynamicSVG";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";

const createIcon = (paths: string[], textDark: string) => (
  <DynamicSVG width="28" height="28" viewBox="0 0 28 28">
    {paths.map((path, index) => (
      <path 
        key={index}
        d={path} 
        stroke={textDark} 
        strokeWidth="1.16667" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    ))}
  </DynamicSVG>
);

const TriagemIcon = (textDark: string) => createIcon([
  "M19.0312 10.0868C19.0313 10.9764 19.3846 11.8296 20.0137 12.4586C20.6427 13.0876 21.4958 13.441 22.3854 13.441C23.275 13.441 24.1281 13.0876 24.7572 12.4586C25.3862 11.8296 25.7396 10.9764 25.7396 10.0868C25.7396 9.19725 25.3862 8.34411 24.7572 7.71508C24.1281 7.08605 23.275 6.73267 22.3854 6.73267C21.4958 6.73267 20.6427 7.08605 20.0137 7.71508C19.3846 8.34411 19.0313 9.19725 19.0312 10.0868Z",
  "M5.6146 2.2605C4.72502 2.2605 3.87188 2.61388 3.24285 3.24291C2.61382 3.87194 2.26044 4.72508 2.26044 5.61466V10.0869C2.26044 11.5695 2.84941 12.9914 3.89779 14.0398C4.94617 15.0882 6.36808 15.6772 7.85071 15.6772C9.33335 15.6772 10.7553 15.0882 11.8036 14.0398C12.852 12.9914 13.441 11.5695 13.441 10.0869V5.61466C13.441 4.72508 13.0876 3.87194 12.4586 3.24291C11.8296 2.61388 10.9764 2.2605 10.0868 2.2605",
  "M7.85065 15.677V24.6215C7.85065 25.2145 8.08624 25.7833 8.50559 26.2026C8.92494 26.622 9.4937 26.8576 10.0868 26.8576C10.6798 26.8576 11.2486 26.622 11.6679 26.2026C12.0873 25.7833 12.3229 25.2145 12.3229 24.6215V18.1725C12.3229 17.4312 12.6174 16.7203 13.1415 16.1961C13.6657 15.6719 14.3767 15.3774 15.118 15.3774C15.8593 15.3774 16.5703 15.6719 17.0945 16.1961C17.6187 16.7203 17.9131 17.4312 17.9131 18.1725V22.3854C17.9131 22.9784 18.1487 23.5472 18.5681 23.9665C18.9874 24.3859 19.5562 24.6215 20.1493 24.6215C20.7423 24.6215 21.3111 24.3859 21.7304 23.9665C22.1498 23.5472 22.3854 22.9784 22.3854 22.3854V13.4409",
  "M5.61456 1.14258V3.93772",
  "M10.0869 1.14258V3.93772"
], textDark);

const RedeCredenciadaIcon = (textDark: string) => createIcon([
  "M22.9429 10.025C22.9429 14.9733 14.0001 26.9169 14.0001 26.9169C14.0001 26.9169 5.05731 14.9733 5.05731 10.025C5.05731 7.65327 5.99949 5.37864 7.67658 3.70155C9.35368 2.02445 11.6283 1.08228 14.0001 1.08228C16.3718 1.08228 18.6465 2.02445 20.3236 3.70155C22.0007 5.37864 22.9429 7.65327 22.9429 10.025Z",
  "M11.4996 13.9991V6.49731M16.5007 6.49731V13.9991M11.4996 9.9356H16.5007"
], textDark);

const AtestadosIcon = (textDark: string) => createIcon([
  "M26.7443 15.5441V21.0882C26.7443 21.6296 26.3054 22.0685 25.7639 22.0685H2.23636C1.69494 22.0685 1.25604 21.6296 1.25604 21.0882V5.40317C1.25604 4.86176 1.69494 4.42285 2.23636 4.42285H6.68452",
  "M12.0396 22.0688L10.079 26.9704",
  "M15.9608 22.0688L17.9214 26.9704",
  "M8.11823 26.9702H19.882",
  "M16.8639 1.17139H17.9616C18.2528 1.17139 18.532 1.28705 18.7379 1.49292C18.9437 1.69879 19.0594 1.97802 19.0594 2.26916V5.27978C19.0594 6.44437 18.5967 7.56126 17.7733 8.38475C16.9498 9.20824 15.8329 9.67087 14.6683 9.67087C13.5038 9.67087 12.3868 9.20824 11.5633 8.38475C10.7399 7.56126 10.2772 6.44437 10.2772 5.27978V2.26916C10.2772 1.97802 10.3929 1.69879 10.5988 1.49292C10.8046 1.28705 11.0839 1.17139 11.375 1.17139H12.4728",
  "M24.5485 7.47532C25.761 7.47532 26.744 6.49234 26.744 5.27978C26.744 4.06722 25.761 3.08423 24.5485 3.08423C23.3358 3.08423 22.3529 4.06722 22.3529 5.27978C22.3529 6.49234 23.3358 7.47532 24.5485 7.47532Z",
  "M14.6682 9.67064V10.2195C14.6682 11.5297 15.1887 12.7862 16.115 13.7126C17.0414 14.6391 18.2979 15.1595 19.6081 15.1595C20.9183 15.1595 22.1748 14.6391 23.1012 13.7126C24.0277 12.7862 24.5481 11.5297 24.5481 10.2195V7.4751"
], textDark);

const PerguntasFrequentesIcon = (textDark: string) => createIcon([
  "M16.1636 12.7819C16.7403 12.2369 17.5069 11.9381 18.3005 11.9493C19.0939 11.9604 19.8518 12.2806 20.413 12.8418C20.9741 13.4028 21.2943 14.1608 21.3055 14.9543C21.3167 15.7478 21.0179 16.5143 20.4727 17.0911L16.8002 20.7636C16.2267 21.3126 15.4616 21.6162 14.6677 21.6097C13.8739 21.6033 13.1138 21.2874 12.5493 20.7293C11.9847 20.171 11.6602 19.4147 11.6448 18.6209C11.6294 17.8272 11.9242 17.0587 12.4666 16.479L16.1636 12.7819Z",
  "M14.4991 14.4475L18.8082 18.7566",
  "M9.68594 13.3277C11.788 13.3277 13.4919 11.6237 13.4919 9.52177C13.4919 7.41979 11.788 5.71582 9.68594 5.71582C7.58398 5.71582 5.88 7.41979 5.88 9.52177C5.88 11.6237 7.58398 13.3277 9.68594 13.3277Z",
  "M5.88 9.52197H13.4919",
  "M13.023 24.7436C19.4959 24.7436 24.7432 19.4962 24.7432 13.0232C24.7432 6.55033 19.4959 1.30298 13.023 1.30298C6.55002 1.30298 1.30267 6.55033 1.30267 13.0232C1.30267 19.4962 6.55002 24.7436 13.023 24.7436Z",
  "M21.3058 21.3049L26.6971 26.6962"
], textDark);

type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  status?: string;
  action: string;
  footnote?: string;
  route?: string;
};

export function ServicesGrid() {
  const router = useRouter();
  const theme = useThemeColors();
  const { theme: themeObject, currentTheme: tenantName } = useTheme();
  const isDefaultTheme = themeObject?.id === 'default';

  const services: Service[] = [
    {
      title: "Triagem",
      description: "Avaliação médica inteligente 24/7",
      icon: TriagemIcon(theme.textDark),
      features: ["Triagem inteligente (IA)", "Resultados em 2min", "Validação profissional"],
      status: "Disponível agora",
      action: "Acessar",
      route: "/paciente/triagem",
    },
    {
      title: "Rede credenciada",
      description: "Especialistas e clínicas parceiras",
      icon: RedeCredenciadaIcon(theme.textDark),
      features: ["Especialistas", "Clínicas", "Hospitais"],
      action: "Acessar",
      footnote: "500+ profissionais",
    },
    {
      title: "Atestados",
      description: "Validação de atestados médicos",
      icon: AtestadosIcon(theme.textDark),
      features: ["Upload automático do atestado", "Análise por IA em segundos", "Resumo validado para conferência"],
      status: "Disponível agora",
      action: "Acessar",
      route: "/paciente/atestados",
    },
    {
      title: "Perguntas frequentes",
      description: "Encontre respostas rápidas",
      icon: PerguntasFrequentesIcon(theme.textDark),
      features: [
        "Como a IA realiza a triagem dos sintomas",
        "Segurança e uso ético da inteligência artificial",
        "Como meus dados são protegidos",
      ],
      status: "Disponível agora",
      action: "Acessar",
      route: "/paciente/faq",
    },
  ];

  const handleNavigate = (route?: string) => {
    if (route) {
      const urlWithTenant = getUrlWithTenant(route, tenantName);
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
        {services.map((s, i) => {
          const serviceId = s.title.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[àáâã]/g, "a")
            .replace(/[ç]/g, "c") + "-service";
          
          return (
          <Card
            key={i}
            id={serviceId}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 6px)", md: "1 1 calc(50% - 8px)" },
              borderRadius: { xs: "12px", md: "12px" },
              boxShadow: "none",
              border: { xs: `1px solid ${isDefaultTheme ? theme.primary : theme.softBorder}`, md: "none" },
              overflow: "hidden",
              fontFamily: "Chivo, sans-serif",
              minHeight: { xs: "auto", md: "260px" },
              maxHeight: { xs: "auto", md: "260px" },
            }}
          >
            <Box
              sx={{
                backgroundColor: isDefaultTheme ? theme.chipBackground : theme.backgroundSoft,
                px: { xs: "12px", md: "16px" },
                py: { xs: "12px", md: "16px" },
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderBottom: `2px solid ${theme.primary}`,
              }}
            >
              <Box
                sx={{
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  borderRadius: "9999px",
                  backgroundColor: isDefaultTheme ? theme.primary : theme.iconBackground,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& svg": { 
                    width: { xs: 20, md: 24 }, 
                    height: { xs: 20, md: 24 },
                    color: isDefaultTheme ? theme.white : theme.primary 
                  },
                }}
              >
                {s.icon}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h3"
                  sx={{
                    fontSize: { xs: "16px", md: "20px" },
                    lineHeight: { xs: "22px", md: "28px" },
                    letterSpacing: "-0.4px",
                    fontWeight: 700,
                    color: theme.textDark,
                  }}
                >
                  {s.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "12px", md: "14px" },
                    lineHeight: { xs: "16px", md: "20px" },
                    fontWeight: 400,
                    color: theme.textMuted,
                  }}
                >
                  {s.description}
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ px: { xs: "12px", md: "16px" }, py: { xs: "12px", md: "16px" } }}>
               <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "6px", md: "8px" }, mb: { xs: 1.5, md: 2 } }}>
                 {s.features.map((f, idx) => (
                   <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                     <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: isDefaultTheme ? theme.secondary : theme.primary }} />
                     <Typography sx={{ fontSize: { xs: "12px", md: "14px" }, lineHeight: { xs: "16px", md: "20px" }, color: theme.textMuted }}>
                       {f}
                     </Typography>
                   </Box>
                 ))}
               </Box>

               <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: { xs: 0.5, md: 1 } }}>
                {s.status ? (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#BCDF84" }} />
                    <Typography sx={{ fontSize: "11px", lineHeight: "14px", color: theme.textMuted }}>
                      {s.status}
                    </Typography>
                  </Box>
                ) : s.footnote ? (
                  <Typography sx={{ fontSize: "11px", lineHeight: "14px", color: theme.textMuted }}>
                    {s.footnote}
                  </Typography>
                ) : <span />}

                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => handleNavigate(s.route)}
                  sx={{
                    backgroundColor: isDefaultTheme ? theme.secondary : theme.primary,
                    color: isDefaultTheme ? theme.white : theme.secondary,
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: { xs: "12px", md: "14px" },
                    lineHeight: { xs: "16px", md: "20px" },
                    minWidth: { xs: 70, md: 84 },
                    height: { xs: 32, md: 40 },
                    px: { xs: 2, md: 2.5 },
                    borderRadius: "8px",
                    "&:hover": { 
                      backgroundColor: isDefaultTheme ? theme.secondary : theme.primary, 
                      opacity: 0.9 
                    },
                  }}
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

