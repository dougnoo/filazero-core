"use client";

import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Drawer,
} from "@mui/material";
import DynamicSVG from "@/shared/components/DynamicSVG";
import { theme } from "@/shared/theme";

export interface AppHeaderProps {
  logoSrc?: string;
  userName: string;
  userEmail: string;
  avatarInitials: string;
  profilePictureUrl?: string;
  showOnlineChip?: boolean;
  onLogout: () => void;
  onMenuOpen?: (event: React.MouseEvent<HTMLElement>) => void;
  themeColors: {
    primary: string;
    textDark: string;
    background: string;
    border: string;
    avatarBackground: string;
  };
  additionalMenuItems?: React.ReactNode;
  userMenu?: React.ReactNode;
}

export function AppHeader({
  logoSrc,
  userName,
  userEmail,
  avatarInitials,
  profilePictureUrl,
  showOnlineChip = false,
  onLogout,
  onMenuOpen,
  themeColors,
  additionalMenuItems,
  userMenu,
}: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Default logo SVG
  const defaultLogo = (
    <DynamicSVG width="100" height="39" viewBox="0 0 100 39">
      <path
        d="M10.5634 4.57739H17.6057V32.7464H10.5634V4.57739Z"
        fill={themeColors.primary}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.169 22.1829L28.169 15.1406L10.5634 15.1406L10.5634 22.1829L28.169 22.1829ZM9.50705 22.1829L9.50705 15.1406L7.62939e-06 15.1406L7.32157e-06 22.1829L9.50705 22.1829Z"
        fill={themeColors.primary}
      />
      <path
        d="M43.369 31.1619V9.25764H35.0197V6.82384H54.4902V9.25764H46.1409V31.1619H43.369ZM54.4978 31.1619V13.9224H57.033V18.3168H57.202V31.1619H54.4978ZM57.202 22.1703L56.7626 18.0802C57.1682 16.6154 57.8894 15.4999 58.926 14.7337C59.9626 13.9675 61.157 13.5844 62.5091 13.5844C63.0725 13.5844 63.4556 13.6295 63.6584 13.7196V16.3224C63.5457 16.2774 63.388 16.2548 63.1851 16.2548C62.9823 16.2323 62.7344 16.221 62.4415 16.221C60.7288 16.221 59.4218 16.7393 58.5204 17.7759C57.6415 18.79 57.202 20.2548 57.202 22.1703ZM68.6612 38.0914L72.5147 29.1337L73.1232 28.1872L78.7682 13.9224H81.5401L71.5344 38.0914H68.6612ZM72.819 31.3309L65.0781 13.9224H68.0528L74.7119 29.5055L72.819 31.3309ZM94.9197 31.1619C94.8295 30.7788 94.7619 30.3393 94.7168 29.8436C94.6943 29.3478 94.683 28.7168 94.683 27.9506H94.514V19.7027C94.514 18.3957 94.2098 17.4379 93.6013 16.8295C93.0154 16.1985 92.0577 15.883 90.7281 15.883C89.4211 15.883 88.3732 16.1534 87.5844 16.6943C86.8182 17.2126 86.3901 17.9562 86.2999 18.9252H83.6971C83.8098 17.2576 84.5084 15.9506 85.7929 15.0041C87.0774 14.0576 88.7563 13.5844 90.8295 13.5844C92.9704 13.5844 94.5591 14.0914 95.5957 15.1055C96.6323 16.1196 97.1506 17.6407 97.1506 19.6689V27.9506C97.1506 28.4464 97.1844 28.9647 97.252 29.5055C97.3197 30.0238 97.4098 30.5759 97.5225 31.1619H94.9197ZM89.0042 31.4999C87.2239 31.4999 85.8042 31.0717 84.745 30.2154C83.7084 29.3365 83.1901 28.1421 83.1901 26.6323C83.1901 25.1224 83.7084 23.9506 84.745 23.1168C85.7816 22.283 87.2915 21.6971 89.2746 21.359L95.2915 20.345V22.5759L89.6802 23.4548C88.4182 23.6576 87.4605 23.9957 86.807 24.4689C86.1535 24.9421 85.8267 25.6295 85.8267 26.5309C85.8267 27.4098 86.1197 28.0745 86.7056 28.5252C87.314 28.9759 88.2042 29.2013 89.376 29.2013C90.8859 29.2013 92.114 28.8633 93.0605 28.1872C94.0295 27.4886 94.514 26.5872 94.514 25.483L94.9535 27.883C94.5929 29.0323 93.883 29.9224 92.8239 30.5534C91.7873 31.1844 90.514 31.4999 89.0042 31.4999Z"
        fill={themeColors.primary}
      />
    </DynamicSVG>
  );

  const renderedLogo = logoSrc ? (
    <Box
      component="img"
      src={logoSrc}
      alt="Logo"
      sx={{
        height: "25.5px",
        width: "auto",
        maxHeight: 48,
        objectFit: "contain",
      }}
    />
  ) : (
    defaultLogo
  );

  // Menu Icon
  const MenuIcon = () => (
    <DynamicSVG width="24" height="24" viewBox="0 0 24 24">
      <path
        d="M3 12H21M3 6H21M3 18H21"
        stroke={themeColors.textDark}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </DynamicSVG>
  );

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

  // Drawer content for mobile
  const drawer = (
    <Box sx={{ width: 280, p: 3 }}>
      {/* Header do Drawer */}
      <Box sx={{ mb: 3, pb: 3, borderBottom: `1px solid ${theme.softBorder}` }}>
        <Avatar
          src={profilePictureUrl}
          sx={{
            width: 48,
            height: 48,
            backgroundColor: themeColors.avatarBackground,
            color: themeColors.primary,
            fontSize: 18,
            mb: 2,
            mx: "auto",
          }}
        >
          {!profilePictureUrl ? avatarInitials : ""}
        </Avatar>
        <Typography
          sx={{
            color: themeColors.textDark,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {userName}
        </Typography>
        {showOnlineChip && (
          <Chip
            icon={
              <DynamicSVG width="16" height="16" viewBox="0 0 16 16">
                <path
                  d="M7.99995 13.9999C8.8268 13.9999 9.49709 13.3296 9.49709 12.5028C9.49709 11.6759 8.8268 11.0056 7.99995 11.0056C7.1731 11.0056 6.50281 11.6759 6.50281 12.5028C6.50281 13.3296 7.1731 13.9999 7.99995 13.9999Z"
                  stroke={themeColors.textDark}
                  strokeWidth="0.666667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.17712 9.14277C5.54875 8.76124 5.99303 8.45802 6.48374 8.25097C6.97445 8.04393 7.50166 7.93726 8.03427 7.93726C8.56687 7.93726 9.09408 8.04393 9.58479 8.25097C10.0755 8.45802 10.5198 8.76124 10.8914 9.14277"
                  stroke={themeColors.textDark}
                  strokeWidth="0.666667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.69714 7.21135C3.39282 6.51162 4.21996 5.95633 5.131 5.57741C6.04205 5.19849 7.01901 5.00342 8.00572 5.00342C8.99242 5.00342 9.96938 5.19849 10.8804 5.57741C11.7915 5.95633 12.6186 6.51162 13.3143 7.21135"
                  stroke={themeColors.textDark}
                  strokeWidth="0.666667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0.571411 5.08571C1.54676 4.10986 2.70483 3.33573 3.97945 2.80757C5.25407 2.27941 6.62027 2.00757 7.99998 2.00757C9.3797 2.00757 10.7459 2.27941 12.0205 2.80757C13.2951 3.33573 14.4532 4.10986 15.4286 5.08571"
                  stroke={themeColors.textDark}
                  strokeWidth="0.666667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </DynamicSVG>
            }
            label="Online"
            sx={{
              backgroundColor: theme.successBackground,
              color: theme.success,
              fontWeight: 500,
              width: "100%",
              mt: 1.5,
            }}
            size="small"
          />
        )}
      </Box>

      {/* Menu items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 4 }}>
        {additionalMenuItems}
        {/* Botão de Logout */}
        <Box
          onClick={() => {
            handleDrawerToggle();
            onLogout();
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "transparent",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "rgba(241, 122, 102, 0.1)",
            },
          }}
        >
          <LogoutIcon />
          <Typography
            sx={{
              color: "#F17A66",
              fontSize: "14px",
              fontWeight: 400,
              fontFamily: "Chivo, sans-serif",
            }}
          >
            Sair
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.appBarBackground,
          boxShadow: "none",
          borderBottom: `1px solid ${themeColors.border}`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "center",
            height: { xs: "60px", md: "64px" },
            px: { xs: 1.5, md: 2 },
          }}
        >
          {/* Container centralizado para alinhar com o conteúdo */}
          <Box
            sx={{
              maxWidth: 1200,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              mx: { xs: 0, md: "auto" },
            }}
          >
            {/* --- Botão hambúrguer (mobile) --- */}
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { xs: "flex", md: "none" },
                color: themeColors.textDark,
                mr: 1,
                padding: "8px",
                borderRadius: "8px",
                zIndex: 2,
                "&:hover": {
                  backgroundColor: theme.backgroundSoft,
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* --- Logotipo --- */}
            <Box
              sx={{
                position: { xs: "absolute", md: "relative" },
                left: { xs: "50%", md: "auto" },
                top: { xs: "50%", md: "auto" },
                transform: {
                  xs: "translate(-50%, -50%)",
                  md: "none",
                },
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                flex: { xs: "0 0 auto", md: 1 },
                zIndex: 1,
              }}
            >
              {renderedLogo}
            </Box>

            {/* --- Lado direito (Online + Usuário) --- */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 2,
                zIndex: 2,
              }}
            >
              {showOnlineChip && (
                <Chip
                  icon={
                    <DynamicSVG width="16" height="16" viewBox="0 0 16 16">
                      <path
                        d="M7.99995 13.9999C8.8268 13.9999 9.49709 13.3296 9.49709 12.5028C9.49709 11.6759 8.8268 11.0056 7.99995 11.0056C7.1731 11.0056 6.50281 11.6759 6.50281 12.5028C6.50281 13.3296 7.1731 13.9999 7.99995 13.9999Z"
                        stroke={themeColors.textDark}
                        strokeWidth="0.666667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.17712 9.14277C5.54875 8.76124 5.99303 8.45802 6.48374 8.25097C6.97445 8.04393 7.50166 7.93726 8.03427 7.93726C8.56687 7.93726 9.09408 8.04393 9.58479 8.25097C10.0755 8.45802 10.5198 8.76124 10.8914 9.14277"
                        stroke={themeColors.textDark}
                        strokeWidth="0.666667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.69714 7.21135C3.39282 6.51162 4.21996 5.95633 5.131 5.57741C6.04205 5.19849 7.01901 5.00342 8.00572 5.00342C8.99242 5.00342 9.96938 5.19849 10.8804 5.57741C11.7915 5.95633 12.6186 6.51162 13.3143 7.21135"
                        stroke={themeColors.textDark}
                        strokeWidth="0.666667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M0.571411 5.08571C1.54676 4.10986 2.70483 3.33573 3.97945 2.80757C5.25407 2.27941 6.62027 2.00757 7.99998 2.00757C9.3797 2.00757 10.7459 2.27941 12.0205 2.80757C13.2951 3.33573 14.4532 4.10986 15.4286 5.08571"
                        stroke={themeColors.textDark}
                        strokeWidth="0.666667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </DynamicSVG>
                  }
                  label="Online"
                  sx={{
                    backgroundColor: theme.successBackground,
                    color: theme.success,
                    fontWeight: 400,
                    height: "100%",
                    fontSize: "12px",
                    maxHeight: "32px",
                    padding: "8px 12px",
                  }}
                  size="small"
                />
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                }}
                onClick={onMenuOpen}
              >
                <Avatar
                  src={profilePictureUrl}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: themeColors.avatarBackground,
                    color: themeColors.primary,
                    fontSize: 14,
                  }}
                >
                  {!profilePictureUrl ? avatarInitials : ""}
                </Avatar>
                <Typography sx={{ color: themeColors.textDark, fontWeight: 500 }}>
                  {userName}
                </Typography>
                <DynamicSVG width="14" height="14" viewBox="0 0 14 14">
                  <path
                    d="M3.5 5.25L7 8.75L10.5 5.25"
                    stroke={themeColors.textDark}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </DynamicSVG>
              </Box>

              {userMenu}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer para Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Melhor performance no mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
