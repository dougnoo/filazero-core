"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { buildAssetUrl } from "@/shared/theme/createTenantTheme";

export function EvaluationsBanner() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: { xs: 2, md: 2 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          width: "100%",
        }}
      >
        <Box
          aria-labelledby="medico-hero-title"
          sx={{
            position: "relative",
            borderRadius: { xs: "16px", md: "20px" },
            overflow: { xs: "hidden", md: "visible" },
            bgcolor: theme.palette.primary.light,
            boxShadow: "0px 16px 40px rgba(6, 36, 36, 0.08)",
            height: { xs: "auto", sm: "auto", lg: 280 },
            minHeight: { xs: 240, sm: 200, md: 240, lg: 280 },
          }}
        >
          {/* Background Image */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              borderRadius: { xs: "16px", md: "20px" },
              zIndex: 0,
            }}
          >
            <Image
              src={buildAssetUrl('theme/medico/banner-bg.png')}
              alt=""
              fill
              priority
              sizes="(min-width: 1200px) 1200px, 100vw"
              style={{ objectFit: "cover", objectPosition: "52% 50%" }}
            />
          </Box>

          {/* Content Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", lg: "flex-start" },
              px: { xs: 3, sm: 4, md: 16 },
              py: { xs: 5, sm: 4, md: 0 },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "100%", lg: 600 },
                maxWidth: { xs: "100%", lg: 600 },
                textAlign: { xs: "center", sm: "center", lg: "left" },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minHeight: { lg: 223 },
                justifyContent: "center",
                pl: { xs: 0, lg: 5 },
              }}
            >
              <Typography
                id="medico-hero-title"
                component="h1"
                sx={{
                  display: "inline-block",
                  fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "28px", sm: "32px", md: "36px" },
                  lineHeight: { xs: "120%", md: "110%" },
                  letterSpacing: "-0.5px",
                  color: "#FFFFFF",
                }}
              >
                Sua revisão faz a diferença
              </Typography>

              <Typography
                component="p"
                sx={{
                  fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: { xs: "14px", sm: "16px", md: "18px" },
                  lineHeight: { xs: "150%", md: "150%" },
                  color: "#FFFFFF",
                }}
              >
                Confira as recomendações da IA, valide as informações e adicione
                seu parecer profissional.
              </Typography>

              {/* Tags */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 1,
                }}
              >
                {["#MedicinaInteligente", "#TryaHealth", "#IAassistiva"].map(
                  (tag, i) => (
                    <Box
                      key={tag}
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: "20px",
                        bgcolor:
                          i === 0
                            ? theme.palette.secondary.main
                            : "rgba(255, 255, 255, 0.1)",
                        border: `1px solid ${theme.palette.secondary.main}`,
                        backdropFilter: "blur(10px)",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: i === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                      }}
                    >
                      {tag}
                    </Box>
                  )
                )}
              </Box>
            </Box>

            {/* Doctor Image - desktop only above 1200px */}
            <Box
              sx={{
                display: { xs: "none", lg: "block" },
                position: "absolute",
                right: "10rem",
                top: "50%",
                width: 403,
                height: 280,
                maxWidth: 403,
                maxHeight: 280,
                transform: "translateY(-50%) translateY(-80px)",
                filter: "drop-shadow(0px 8px 18px rgba(6,36,36,.18))",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              <Image
                src={buildAssetUrl('theme/medico/dra-banner.png')}
                alt="Médica sorridente representando o profissional de saúde da plataforma."
                width={403}
                height={361}
                sizes="403px"
                style={{
                  width: "100%",
                  height: "361px",
                  objectFit: "cover",
                  objectPosition: "left",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
