"use client";

import { useEffect } from "react";
import { Box, Menu, MenuItem, Typography, Divider } from "@mui/material";
import DynamicSVG from "@/shared/components/DynamicSVG";

export interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  additionalItems?: React.ReactNode;
  textPrimaryColor?: string;
}

export function UserMenu({
  anchorEl,
  open,
  onClose,
  userName,
  userEmail,
  onLogout,
  additionalItems,
  textPrimaryColor = "#041616",
}: UserMenuProps) {
  // Corrige o warning de aria-hidden quando o menu está aberto
  useEffect(() => {
    if (!anchorEl) return;

    // Função para remover aria-hidden do Modal do Menu quando há foco
    const fixAriaHidden = () => {
      // Corrige Menu do MUI
      const menuModals = document.querySelectorAll(
        ".MuiModal-root.MuiMenu-root"
      );
      menuModals.forEach((modal) => {
        const modalEl = modal as HTMLElement;
        const hasFocusedElement =
          modalEl.querySelector(":focus") ||
          modalEl.querySelector('[tabindex="0"]') ||
          modalEl.querySelector("button:focus") ||
          modalEl.querySelector("a:focus") ||
          modalEl.querySelector("li:focus");

        // Se o menu está aberto e tem elemento focado, remove aria-hidden
        if (
          hasFocusedElement &&
          modalEl.getAttribute("aria-hidden") === "true"
        ) {
          modalEl.removeAttribute("aria-hidden");
        }
      });

      // Corrige tooltips do react-joyride
      const joyrideModals = document.querySelectorAll('[class*="react-joyride"]');
      joyrideModals.forEach((modal) => {
        const modalEl = modal as HTMLElement;
        const hasFocusedElement =
          modalEl.querySelector(":focus") ||
          modalEl.querySelector("button:focus");

        if (
          hasFocusedElement &&
          modalEl.getAttribute("aria-hidden") === "true"
        ) {
          modalEl.removeAttribute("aria-hidden");
        }
      });
    };

    // Executa após um pequeno delay para garantir que o DOM foi atualizado
    let timeoutId: NodeJS.Timeout;
    const scheduleFix = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(fixAriaHidden, 50);
    };

    scheduleFix();

    // Monitora mudanças de foco e atributos
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "aria-hidden"
        ) {
          scheduleFix();
        }
      });
    });

    // Observa mudanças no body para capturar quando o menu é renderizado
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-hidden"],
    });

    // Também executa quando há mudanças de foco
    document.addEventListener("focusin", scheduleFix, true);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
      document.removeEventListener("focusin", scheduleFix, true);
    };
  }, [anchorEl]);

  // Logout Icon
  const LogoutIcon = () => (
    <DynamicSVG width="14" height="14" viewBox="0 0 14 14">
      <path
        d="M6.5 7H13.5"
        stroke="#F17A66"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 5L13.5 7L11.5 9"
        stroke="#F17A66"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.7 11.49C10.802 12.4259 9.6446 13.0719 8.37656 13.3446C7.10852 13.6174 5.78787 13.5046 4.58447 13.0207C3.38108 12.5367 2.34998 11.7039 1.6238 10.6291C0.897627 9.55443 0.509583 8.28704 0.509583 6.98999C0.509583 5.69294 0.897627 4.42555 1.6238 3.35084C2.34998 2.27613 3.38108 1.44325 4.58447 0.959333C5.78787 0.475413 7.10852 0.362584 8.37656 0.635359C9.6446 0.908135 10.802 1.55404 11.7 2.48999"
        stroke="#F17A66"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </DynamicSVG>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      MenuListProps={{
        "aria-labelledby": "user-menu-button",
        autoFocus: false,
      }}
      disableAutoFocusItem
      disableEnforceFocus
      disableRestoreFocus
      sx={{
        mt: 1,
        "& .MuiPaper-root": {
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          minWidth: "250px",
        },
      }}
      slotProps={{
        root: {
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
              onClose();
            }
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: textPrimaryColor,
            fontSize: "16px",
          }}
        >
          {userName}
        </Typography>
        <Typography sx={{ color: "#4A6060", fontSize: "14px", mt: 0.5 }}>
          {userEmail}
        </Typography>
      </Box>
      {additionalItems && <Divider />}
      {additionalItems}
      <Divider />
      <MenuItem
        onClick={onLogout}
        sx={{
          py: 1.5,
          px: 2,
          color: "#F17A66",
          fontSize: "14px",
          "&:hover": {
            backgroundColor: "rgba(241, 122, 102, 0.1)",
          },
        }}
      >
        <LogoutIcon />
        <Box sx={{ ml: 1 }}>Sair</Box>
      </MenuItem>
    </Menu>
  );
}
