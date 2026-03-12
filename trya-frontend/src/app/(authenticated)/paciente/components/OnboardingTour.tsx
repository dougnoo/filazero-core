"use client";

import type { CSSProperties } from "react";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { CallBackProps, Step } from "react-joyride-react-19";
import { STATUS } from "react-joyride-react-19";
import DynamicSVG, {
  DynamicLogo,
  DynamicStrokeElement,
} from "@/shared/components/DynamicSVG";
import { useTheme } from "@mui/material/styles";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import {
  tutorialService,
  type Tutorial,
} from "@/shared/services/tutorialService";

const Joyride = dynamic(() => import("react-joyride-react-19"), { ssr: false });

export function OnboardingTour() {
  const [showIntro, setShowIntro] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  const { assets } = useTenantAssets();
  const isMobile = useMediaQuery("(max-width:600px)", { noSsr: true });

  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const contrastText = theme.palette.primary.contrastText;
  const logoSrc = assets?.logo;

  // Garante que o componente só renderiza após montar no cliente
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Remove quaisquer portais antigos do joyride (evita createRoot duplicado)
  const cleanupJoyridePortals = () => {
    if (typeof document === "undefined") return;
    const portals = document.querySelectorAll(
      'div[data-react-joyride], div[id*="react-joyride"], div[class*="react-joyride"]'
    );
    portals.forEach((el) => el.remove());
  };

  // Injeta CSS global e adiciona seta no botão "Próximo"
  useEffect(() => {
    if (typeof document === 'undefined' || !isMounted || !runTour) return;

    const styleId = 'joyride-tooltip-custom-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    


    // Rastrear elementos já processados para evitar reprocessamento
    const processedButtons = new WeakSet<HTMLElement>();
    let timeoutId: NodeJS.Timeout | null = null;
    let isProcessing = false;

    // Observer para aplicar estilos quando o tooltip for renderizado
    const observer = new MutationObserver((mutations) => {
      // Só processa se o tour estiver rodando
      if (!runTour) return;
      
      // Só processa se não estiver processando
      if (isProcessing) return;
      
      // Verifica se há mudanças relacionadas ao react-joyride
      const hasJoyrideChanges = mutations.some(mutation => {
        const target = mutation.target as HTMLElement;
        return target.classList?.toString().includes('react-joyride') ||
               target.closest('[class*="react-joyride"]') !== null;
      });

      // Se não há mudanças do joyride e não há tooltip visível, ignora
      if (!hasJoyrideChanges && !document.querySelector('[class*="react-joyride__tooltip"]')) {
        return;
      }

      // Debounce para evitar processamento excessivo
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (isProcessing || !runTour) return;
        isProcessing = true;

        try {          
          // Adiciona seta apenas em botões que ainda não foram processados
          const nextButtons = document.querySelectorAll(
            'button[data-test-id="button-primary"], button[class*="react-joyride__button--next"], button[aria-label="Próximo"]'
          );
          
          nextButtons.forEach((button) => {
            const buttonEl = button as HTMLElement;
            
            // Se já foi processado, ignora
            if (processedButtons.has(buttonEl)) return;
            
            // Verifica se já tem a seta
            if (button.querySelector('.joyride-arrow-icon')) {
              processedButtons.add(buttonEl);
              return;
            }
            
            // Encontra o texto do botão
            const buttonText = Array.from(button.childNodes).find(
              node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === 'Próximo'
            ) as Text | undefined;
            
            // Cria o elemento SVG da seta com cor secundária
            const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            arrowSvg.setAttribute('width', '20');
            arrowSvg.setAttribute('height', '20');
            arrowSvg.setAttribute('viewBox', '0 0 20 20');
            arrowSvg.setAttribute('fill', 'none');
            arrowSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            arrowSvg.style.display = 'inline-block';
            arrowSvg.style.marginRight = '8px';
            arrowSvg.style.verticalAlign = 'middle';
            arrowSvg.classList.add('joyride-arrow-icon');
            
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M0.714294 10H19.2857');
            path1.setAttribute('stroke', secondaryColor);
            path1.setAttribute('stroke-linecap', 'round');
            path1.setAttribute('stroke-linejoin', 'round');
            
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M14.2858 15L19.2858 10L14.2858 5');
            path2.setAttribute('stroke', secondaryColor);
            path2.setAttribute('stroke-linecap', 'round');
            path2.setAttribute('stroke-linejoin', 'round');
            
            arrowSvg.appendChild(path1);
            arrowSvg.appendChild(path2);
            
            // Adiciona a seta antes do texto do botão
            if (buttonText) {
              button.insertBefore(arrowSvg, buttonText);
            } else {
              button.insertBefore(arrowSvg, button.firstChild);
            }
            
            // Marca como processado
            processedButtons.add(buttonEl);
          });
          
          // NÃO aplica estilos inline - deixa o CSS fazer o trabalho
        } finally {
          isProcessing = false;
        }
      }, 200);
    });

    // Observa mudanças no DOM apenas quando necessário
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      observer.disconnect();
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [isMounted, runTour, secondaryColor, contrastText]);

  // Limpa portais ao desmontar
  useEffect(() => {
    return () => {
      cleanupJoyridePortals();
    };
  }, []);

  // Função para iniciar o tutorial manualmente
  const startManualTutorial = useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Tenta buscar um tutorial pendente primeiro
      const tutorials = await tutorialService.getPendingTutorials();
      const tutorial = tutorials.find((t) => t.code === "onboarding-welcome");

      if (tutorial) {
        setCurrentTutorial(tutorial);
        setShowIntro(true);
      } else {
        // Se não houver tutorial pendente, cria um tutorial "fake" para permitir repetição
        // O tutorial pode ser repetido sem salvar no backend
        const manualTutorial: Tutorial = {
          id: 'manual-tutorial',
          code: 'onboarding-welcome',
          title: 'Tutorial da Plataforma',
          description: 'Aprenda a usar a plataforma',
          version: '1.0.0',
          order: 0,
        };
        setCurrentTutorial(manualTutorial);
        setShowIntro(true);
      }
    } finally {
      setIsLoading(false);
      // Remove o sinal do localStorage
      localStorage.removeItem('start_tutorial_manually');
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkPendingTutorials = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verifica se há sinal para iniciar tutorial manualmente
        const shouldStartManually = localStorage.getItem('start_tutorial_manually') === 'true';
        
        if (shouldStartManually) {
          await startManualTutorial();
          return;
        }

        const tutorials = await tutorialService.getPendingTutorials();
        
        const tutorial = tutorials.find((t) => t.code === "onboarding-welcome");

        if (tutorial) {
          setCurrentTutorial(tutorial);
          setShowIntro(true);
        } else if (tutorials.length === 0) {
          // Fallback: se não há tutoriais pendentes mas é o primeiro login,
          // exibe o tour como "manual-tutorial" para garantir a experiência de onboarding
          const isFirstLogin = localStorage.getItem("user_is_first_login") === "true";
          if (isFirstLogin) {
            const manualTutorial: Tutorial = {
              id: 'manual-tutorial',
              code: 'onboarding-welcome',
              title: 'Tutorial da Plataforma',
              description: 'Aprenda a usar a plataforma',
              version: '1.0.0',
              order: 0,
            };
            setCurrentTutorial(manualTutorial);
            setShowIntro(true);
            // Remove a flag para não exibir novamente em acessos futuros
            localStorage.removeItem("user_is_first_login");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkPendingTutorials();
  }, [isMounted, startManualTutorial]);

  // Escuta o evento customizado para iniciar o tutorial
  useEffect(() => {
    if (!isMounted) return;

    const handleStartTutorial = () => {
      startManualTutorial();
    };

    window.addEventListener('startTutorial', handleStartTutorial);

    return () => {
      window.removeEventListener('startTutorial', handleStartTutorial);
    };
  }, [isMounted, startManualTutorial]);

  const finishTour = async (skipped = false) => {
    if (!currentTutorial) return;

    try {
      // Só salva no backend se não for um tutorial manual (repetível)
      if (currentTutorial.id !== 'manual-tutorial') {
        await tutorialService.completeTutorial(currentTutorial.id, skipped);
      }
    } finally {
      setRunTour(false);
      setShowIntro(false);
      setCurrentTutorial(null);
    }
  };

  const handleCloseFromFinalStep = () => finishTour(false);
  const handleSkipFromIntro = () => finishTour(true);
  const handleStartFromIntro = () => {
    setShowIntro(false);
    cleanupJoyridePortals();
    setRunTour(true);
  };

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    const isSkipped = status === STATUS.SKIPPED;
    
    if (status === STATUS.FINISHED || isSkipped) {
      finishTour(isSkipped);
    }
  };

  const steps: Step[] = [
    {
      target: "#tour-patient-card",
      placement: "right",
      disableBeacon: true,
      content: (
        <Box sx={{ maxWidth: { xs: "100%", sm: 400 } }}>
          <Typography
            sx={{
              mb: 1.5,
              fontSize: { xs: 13, sm: 14 },
              lineHeight: 1.6,
            }}
          >
            Aqui você visualiza os principais dados do seu plano de saúde —
            operadora, validade, e seus dados de identificação.
          </Typography>
        </Box>
      ),
    },
    {
      target: "#patient-history-card",
      placement: "right",
      disableBeacon: true,
      content: (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ mb: 1.5, fontSize: 14, lineHeight: 1.5}}>
            Suas condições pré-existentes, medicamentos e alergias ficam aqui.
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5}}>
            A IA usa essas informações para gerar triagens mais seguras e
            personalizadas.
          </Typography>
        </Box>
      ),
    },
    {
      target: "#clinical-history-card",
      placement: "right",
      disableBeacon: true,
      content: (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ mb: 1.5, fontSize: 14, lineHeight: 1.5 }}>
            Veja suas últimas consultas e profissionais que o atenderam.
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5}}>
            Tudo centralizado e validado.
          </Typography>
        </Box>
      ),
    },
    {
      target: "#triagem-service",
      placement: "right",
      disableBeacon: true,
      content: (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ mb: 1.5, fontSize: 14, lineHeight: 1.5}}>
            Descreva seus sintomas e receba uma análise imediata feita pela IA.
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5}}>
            Resultados em até 2 minutos, com validação profissional.
          </Typography>
        </Box>
      ),
    },
    {
      target: "#atestados-service",
      placement: "right",
      disableBeacon: true,
      content: (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ mb: 1.5, fontSize: 14, lineHeight: 1.5}}>
            Envie seus atestados médicos para validação automática por IA.
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>
            Receba o resumo pronto para conferência em segundos.
          </Typography>
        </Box>
      ),
    },
    {
      target: "#rede-credenciada-service",
      placement: "left",
      disableBeacon: true,
      content: (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ mb: 1.5, fontSize: 14, lineHeight: 1.5}}>
            Encontre especialistas, clínicas e hospitais parceiros.
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5}}>
            Mais de 500 profissionais à disposição.
          </Typography>
        </Box>
      ),
    },
    {
      target: "#perguntas-frequentes-service",
      placement: "left",
      disableBeacon: true,
      content: (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5, }}>
            Entenda como a IA funciona, como seus dados são protegidos e tire
            dúvidas rapidamente.
          </Typography>
        </Box>
      ),
    },
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      hideFooter: true,
      styles: {
        tooltip: {
          width: "100%",
          maxWidth: "min(552px, 90vw)",
          padding: isMobile ? 16 : 24,
          border: "none",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        },
      },
      content: (
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 2,
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleCloseFromFinalStep}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              padding: "8px",
              color: "#6B7280",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              borderRadius: "50%",
              bgcolor: 'primary.light',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 16L12.1 19.28C12.2101 19.3707 12.339 19.4357 12.4774 19.4703C12.6158 19.5049 12.7602 19.5082 12.9 19.48C13.0412 19.4535 13.175 19.3969 13.2923 19.3141C13.4097 19.2313 13.5078 19.1242 13.58 19L20 8"
                stroke="#041616"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 27C21.1797 27 27 21.1797 27 14C27 6.8203 21.1797 1 14 1C6.8203 1 1 6.8203 1 14C1 21.1797 6.8203 27 14 27Z"
                stroke="#041616"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Typography
            sx={{
              fontSize: { xs: 20, sm: 24 },
              fontWeight: 700,
              mb: 1.5,
            }}
          >
            Tudo pronto!
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 13, sm: 14 },
              lineHeight: 1.6,
              mb: 4,
              px: { xs: 1, sm: 2 },
            }}
          >
            Agora você já conhece os principais recursos da Trya. Explore,
            realize sua primeira triagem e conte com a nossa IA para cuidar de
            você de forma inteligente e segura.
           </Typography>

           <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 3,
              mt: 1,
            }}
          >
            <Button
              fullWidth
              onClick={handleCloseFromFinalStep}
              sx={{
                borderRadius: "8px",
                backgroundColor: primaryColor,
                color: contrastText,
                fontSize: { xs: "13px", sm: "14px" },
                fontWeight: 500,
                textTransform: "none",
                padding: { xs: "12px 24px", sm: "14px 48px" },
                "&:hover": {
                  backgroundColor: primaryColor,
                  opacity: 0.9,
                },
              }}
            >
              Concluir tour
            </Button>
          </Box>
        </Box>
      ),
    },
  ];

  if (!isMounted || isLoading) {
    return null;
  }

  return (
    <>
      {isMounted && (
        <Dialog
          open={showIntro}
          onClose={handleSkipFromIntro}
          disableEnforceFocus
          disableAutoFocus
          disableRestoreFocus
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              maxWidth: { xs: "90%", sm: 520 },
              width: "100%",
              mx: 2,
            },
          }}
          BackdropProps={{
            sx: { backgroundColor: "rgba(15, 23, 42, 0.7)" },
          }}
        >
          <IconButton
            size="small"
            onClick={handleSkipFromIntro}
            sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}
           >
             <CloseIcon />
           </IconButton>

           <Box
            sx={{
              backgroundColor: 'primary.light',
              borderRadius: 3,
              mb: 3,
              marginTop: { xs: "1rem", sm: "2rem" },
              height: { xs: 120, sm: 190 },
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
             }}
           >
             <Box
              sx={{
                position: "absolute",
                top: "-74px",
                right: "-80px",
                width: "220px",
                height: "240px",
                zIndex: 0,
              }}
            >
              <DynamicSVG
                width="240"
                height="240"
                viewBox="0 0 240 240"
                className="w-full h-full"
              >
                <mask
                  id="mask0_tour_modal"
                  style={{ maskType: "alpha" } as CSSProperties}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="240"
                  height="240"
                >
                  <circle cx="120" cy="120" r="120" fill={primaryColor} />
                </mask>
                <g mask="url(#mask0_tour_modal)">
                  <circle
                    cx="120"
                    cy="120"
                    r="120"
                    fill={secondaryColor}
                  />
                  <DynamicStrokeElement
                    stroke={primaryColor}
                    strokeWidth="1.5"
                  >
                    <circle cx="62.5" cy="291" r="125" />
                    <circle cx="-62.7" cy="160.5" r="109.3" />
                    <circle cx="166.5" cy="-0.2" r="73.2" />
                    <circle cx="210.3" cy="73.2" r="73.2" />
                  </DynamicStrokeElement>
                </g>
               </DynamicSVG>
             </Box>

             <Box
              sx={{
                position: "absolute",
                bottom: "-10px",
                left: "5px",
                width: "232px",
                height: "37px",
                zIndex: 0,
              }}
            >
              <DynamicSVG
                width="232"
                height="37"
                viewBox="0 0 232 37"
                className="w-full h-full"
              >
                <DynamicStrokeElement
                  stroke={secondaryColor}
                  strokeWidth="1.5"
                >
                  <circle cx="105.5" cy="126.7" r="125.5" />
                </DynamicStrokeElement>
               </DynamicSVG>
             </Box>

             <Box
              sx={{
                position: "absolute",
                bottom: "-1px",
                left: "-11px",
                width: "91px",
                height: "151px",
                zIndex: 0,
              }}
            >
              <DynamicSVG
                width="91"
                height="151"
                viewBox="0 0 91 151"
                className="w-full h-full"
              >
                <DynamicStrokeElement
                  stroke={secondaryColor}
                  strokeWidth="1.5"
                >
                  <circle cx="-19.8" cy="110.4" r="109.5" />
                </DynamicStrokeElement>
               </DynamicSVG>
             </Box>

             <Box sx={{ position: "relative", zIndex: 1 }}>
              {logoSrc ? (
                <Box
                  component="img"
                  src={logoSrc}
                  alt="Logo"
                  sx={{
                    height: { xs: "52px", sm: "68px" },
                    width: "auto",
                    maxWidth: { xs: "140px", sm: "180px" },
                    objectFit: "contain",
                  }}
                />
              ) : (
                <DynamicLogo
                  width={isMobile ? 140 : 180}
                  height={isMobile ? 52 : 68}
                  color={primaryColor}
                />
              )}
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: 15, sm: 16 },
              fontWeight: 700,
              textAlign: "center",
              mb: 1,
            }}
          >
            Ferramenta de apoio à decisão clínica.
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 13, sm: 14 },
              textAlign: "center",
              lineHeight: 1.6,
              mb: 3,
            }}
          >
            Aqui você realiza triagem, envia atestados e acessa informações do
            seu plano — tudo integrado.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSkipFromIntro}
            >
              Pular
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleStartFromIntro}
            >
              Começar tour
            </Button>
          </Box>
         </Dialog>
       )}

      {isMounted && runTour && (
        <Joyride
          run={runTour}
          steps={steps}
          callback={handleCallback}
          continuous
          showSkipButton
          showProgress={false}
          scrollToFirstStep
          disableOverlayClose
          styles={{
            options: {
              primaryColor: primaryColor,
              zIndex: 2000,
              overlayColor: "rgba(15, 23, 42, 0.70)",
            },
            tooltip: {
              borderRadius: 16,
              padding: isMobile ? 16 : 24,
            },
            tooltipContainer: {
              textAlign: "left",
            },
            tooltipContent: {
              padding: "0 0 20px 0",
              marginBottom: 20,
            },
            tooltipFooter: {
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: 0,
              gap: 12,
            },
            tooltipFooterSpacer: {
              flex: "0 0 auto",
            },
            buttonNext: {
              borderRadius: 8,
              backgroundColor: primaryColor,
              padding: isMobile ? "10px 20px" : "12px 16px",
              fontSize: isMobile ? 13 : 14,
              fontWeight: 500,
              height: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              order: 3,
              minWidth: "auto",
            },
            buttonBack: {
              display: "none",
            },
            buttonSkip: {
              color: "#6B7280",
              fontSize: isMobile ? 13 : 14,
              fontWeight: 500,
              padding: isMobile ? "10px 12px" : "12px 16px",
              marginLeft: 0,
              marginRight: 0,
              order: 2,
            },
            buttonClose: {
              display: "none",
            },
          }}
          locale={{
            back: "Voltar",
            close: "Fechar",
            last: "Concluir tour",
            next: "Próximo",
            skip: "Sair",
          }}
        />
      )}
    </>
  );
}
