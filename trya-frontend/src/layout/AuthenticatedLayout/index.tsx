"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Typography, MenuItem, Divider } from "@mui/material";
import DynamicSVG from "@/shared/components/DynamicSVG";
import { authService, type UserProfile } from "@/shared/services/authService";
import { isRole, type RoleSlug, RoleEnum } from "@/shared/role";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { UserProfileProvider } from "@/shared/context/UserProfileContext";
import { AppHeader } from "@/layout/shared/AppHeader";
import { PageContainer } from "@/layout/shared/PageContainer";
import { NotificationDropdown } from "@/shared/components/NotificationDropdown";
import ContactModal from "@/shared/components/ContactModal";

const DEFAULT_ROLE: RoleSlug = RoleEnum.Paciente;
const ROLE_ALIASES: Record<string, RoleSlug> = {
  admin: RoleEnum.AdminRh,
  superadmin: RoleEnum.SuperAdmin,
  "super-admin": RoleEnum.SuperAdmin,
};

const resolveRole = (pathname: string, searchParams: URLSearchParams | null): RoleSlug => {
  const segments = pathname.split("/").filter(Boolean);
  for (const segment of segments) {
    const normalized = segment.toLowerCase();
    if (isRole(normalized)) return normalized;
    if (ROLE_ALIASES[normalized]) return ROLE_ALIASES[normalized];
  }
  const roleParam = searchParams?.get("role")?.toLowerCase() ?? null;
  if (roleParam) {
    if (isRole(roleParam)) return roleParam as RoleSlug;
    if (ROLE_ALIASES[roleParam]) return ROLE_ALIASES[roleParam];
  }
  return DEFAULT_ROLE;
};

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { assets } = useTenantAssets();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<RoleSlug>(DEFAULT_ROLE);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Rotas restritas para dependentes
  const DEPENDENT_RESTRICTED_ROUTES = [
    "/paciente/gestao-familiar",
    "/paciente/atestados",
    "/paciente/faq",
  ];

  const logoSrc = assets.logo ?? "";
  const faviconSrc = assets.favicon ?? "";

  useEffect(() => {
    if (!faviconSrc) return;
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (link) {
      link.href = faviconSrc;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconSrc;
      document.head.appendChild(newLink);
    }
  }, [faviconSrc]);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        if (!isAuthenticated) {
          authService.logout();
          const tenant = new URLSearchParams(window.location.search).get("tenant");
          router.replace(tenant ? `/login?tenant=${tenant}` : `/login`);
          return;
        }
        try {
          const profile = await authService.getUserProfile();
          setUserProfile(profile);
          
          // Redireciona dependentes que tentam acessar rotas restritas
          const isDependentUser = profile.role?.toUpperCase() === "DEPENDENT";
          const isRestricted = DEPENDENT_RESTRICTED_ROUTES.some((route) =>
            pathname?.startsWith(route)
          );
          
          if (isDependentUser && isRestricted) {
            router.replace("/paciente");
            return;
          }
        } catch {
          authService.logout();
          const tenant = new URLSearchParams(window.location.search).get("tenant");
          router.replace(tenant ? `/login?tenant=${tenant}` : `/login`);
          return;
        }
      } catch {
        authService.logout();
        const tenant = new URLSearchParams(window.location.search).get("tenant");
        router.replace(tenant ? `/login?tenant=${tenant}` : `/login`);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthentication();
  }, [router, pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setCurrentRole(resolveRole(pathname ?? window.location.pathname, params));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      authService.logout();
      const params = new URLSearchParams(window.location.search);
      const tenant = params.get("tenant");
      window.location.href = tenant ? `/login?tenant=${tenant}` : `/login`;
    } catch {
      const params = new URLSearchParams(window.location.search);
      const tenant = params.get("tenant");
      window.location.href = tenant ? `/login?tenant=${tenant}` : `/login`;
    }
  };

  if (isCheckingAuth) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <Box sx={{ textAlign: "center" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <Typography>Verificando autenticação...</Typography>
        </Box>
      </Box>
    );
  }

  const TutorialIcon = () => (
    <DynamicSVG width="20" height="20" viewBox="0 0 24 24">
      <g clipPath="url(#clip0_4783_1145)">
        <path d="M20.5712 3.42871H22.2855C22.5128 3.42871 22.7309 3.51902 22.8916 3.67976C23.0523 3.84051 23.1426 4.05853 23.1426 4.28585V18.0001C23.1426 18.2275 23.0523 18.4455 22.8916 18.6062C22.7309 18.767 22.5128 18.8573 22.2855 18.8573H1.71408C1.48675 18.8573 1.26873 18.767 1.10798 18.6062C0.947239 18.4455 0.856934 18.2275 0.856934 18.0001V4.28585C0.856934 4.05853 0.947239 3.84051 1.10798 3.67976C1.26873 3.51902 1.48675 3.42871 1.71408 3.42871H3.42836" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.2856 18.8572L8.57129 23.1429" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.7139 18.8572L15.4282 23.1429" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.85693 23.1428H17.1426" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.57129 4.28575C8.57129 3.60764 8.77237 2.94476 9.14911 2.38094C9.52584 1.81711 10.0613 1.37766 10.6878 1.11816C11.3143 0.858663 12.0037 0.790766 12.6687 0.923058C13.3338 1.05535 13.9447 1.38189 14.4242 1.86138C14.9037 2.34088 15.2303 2.95179 15.3626 3.61687C15.4948 4.28195 15.4269 4.97132 15.1674 5.59781C14.9079 6.2243 14.4685 6.75977 13.9047 7.1365C13.3408 7.51324 12.678 7.71432 11.9999 7.71432V9.42861" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.9999 14.5715C11.7632 14.5715 11.5713 14.3796 11.5713 14.1429C11.5713 13.9062 11.7632 13.7144 11.9999 13.7144" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 14.5715C12.2367 14.5715 12.4286 14.3796 12.4286 14.1429C12.4286 13.9062 12.2367 13.7144 12 13.7144" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip0_4783_1145"><rect width="24" height="24" fill="white" /></clipPath></defs>
    </DynamicSVG>
  );

  const ShieldIcon = () => (
    <DynamicSVG width="20" height="20" viewBox="0 0 20 20">
      <g clipPath="url(#clip0_7126_26547)">
        <path d="M10.5144 19.1857C10.1834 19.3134 9.81676 19.3134 9.48579 19.1857V19.1857C6.90332 18.1943 4.68236 16.4427 3.11628 14.1625C1.55021 11.8822 0.712689 9.18054 0.714365 6.41429V2.68572C0.713581 2.52929 0.763165 2.37676 0.855784 2.2507C0.948403 2.12463 1.07914 2.03173 1.22865 1.98572C6.95276 0.28601 13.0474 0.28601 18.7715 1.98572C18.921 2.03173 19.0518 2.12463 19.1444 2.2507C19.237 2.37676 19.2866 2.52929 19.2858 2.68572V6.41429C19.2875 9.18054 18.45 11.8822 16.8839 14.1625C15.3178 16.4427 13.0968 18.1943 10.5144 19.1857V19.1857Z" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip0_7126_26547"><rect width="20" height="20" fill="white" /></clipPath></defs>
    </DynamicSVG>
  );

  // Ícone de Contato
  const ContactIcon = () => (
    <DynamicSVG width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </DynamicSVG>
  );

  const userName = userProfile?.name ?? "Usuário";
  const userEmail = userProfile?.email ?? "E-mail não disponível";
  const avatarInitials = userProfile?.name
    ? userProfile.name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "US"
    : "US";

  const isOnboardingPage = pathname?.includes("/onboarding") || pathname?.includes("/privacy-acceptance") || pathname?.includes("/triagem-intro") || pathname?.includes("/triagem/");

  if (isOnboardingPage) {
    return <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>{children}</Box>;
  }

  const getFaqRouteByUserRole = (role?: string | null): string | null => {
    switch ((role ?? "").toUpperCase()) {
      case "BENEFICIARY": return "/paciente/faq";
      default: return null;
    }
  };

  const withTenantQuery = (path: string): string => {
    if (typeof window === "undefined") return path;
    const tenant = new URLSearchParams(window.location.search).get("tenant");
    if (!tenant) return path;
    return path.includes("?") ? `${path}&tenant=${tenant}` : `${path}?tenant=${tenant}`;
  };

  const isBeneficiary = userProfile?.role?.toUpperCase() === "BENEFICIARY";
  const faqRoute = getFaqRouteByUserRole(userProfile?.role);
  const notificationDropdown = isBeneficiary ? <NotificationDropdown /> : null;

  const additionalMenuItems = [
    faqRoute && (
      <MenuItem key="faq" onClick={() => router.push(withTenantQuery(faqRoute))} sx={{ py: 1.5, px: 2, fontSize: "14px" }}>
        Perguntas frequentes
      </MenuItem>
    ),
    isBeneficiary && (
      <MenuItem key="termos" onClick={() => router.push(withTenantQuery("/paciente/termos-privacidade"))} sx={{ py: 1.5, px: 2, fontSize: "14px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldIcon />
          Termos e Privacidade
        </Box>
      </MenuItem>
    ),
    isBeneficiary && (
      <MenuItem
        key="tutorial"
        onClick={() => {
          localStorage.setItem("start_tutorial_manually", "true");
          window.dispatchEvent(new CustomEvent("startTutorial"));
          if (currentRole === RoleEnum.Paciente && !pathname?.includes("/paciente")) {
            router.push("/paciente");
          }
        }}
        sx={{ py: 1.5, px: 2, fontSize: "14px" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TutorialIcon />
          Tutorial da plataforma
        </Box>
      </MenuItem>
    ),
    isBeneficiary && (
      <MenuItem
        key="contato"
        onClick={() => {
          setIsContactModalOpen(true);
        }}
        sx={{ py: 1.5, px: 2, fontSize: "14px" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ContactIcon />
          Contato
        </Box>
      </MenuItem>
    ),
    (faqRoute || isBeneficiary) && <Divider key="divider" />,
  ].filter(Boolean);

  return (
    <UserProfileProvider userProfile={userProfile}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AppHeader
          logoSrc={logoSrc}
          userName={userName}
          userEmail={userEmail}
          avatarInitials={avatarInitials}
          onLogout={handleLogout}
          onLogoClick={() => {
            const firstSegment = pathname.split("/").filter(Boolean)[0];
            router.push(firstSegment ? `/${firstSegment}` : "/");
          }}
          additionalMenuItems={additionalMenuItems}
          notificationDropdown={notificationDropdown}
          showSOSButton={isBeneficiary}
        />
        <PageContainer>{children}</PageContainer>

        {/* Modal de Contato */}
        <ContactModal
          open={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </Box>
    </UserProfileProvider>
  );
}
