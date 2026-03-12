"use client";

import { useCallback, useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

interface UseCollapsibleOnMobileOptions {
  breakpoint?: "xs" | "sm" | "md" | "lg" | "xl";
  collapsible?: boolean;
}

export function useCollapsibleOnMobile({
  breakpoint = "lg",
  collapsible = true,
}: UseCollapsibleOnMobileOptions = {}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));
  const [expanded, setExpanded] = useState<boolean>(!isMobile);

  useEffect(() => {
    if (!isMobile) {
      setExpanded(true);
    }
  }, [isMobile]);

  const handleToggle = useCallback(() => {
    if (collapsible && isMobile) {
      setExpanded((prev) => !prev);
    }
  }, [collapsible, isMobile]);

  const isContentVisible = !collapsible || !isMobile || expanded;

  return {
    isMobile,
    expanded,
    setExpanded,
    handleToggle,
    isContentVisible,
  };
}
