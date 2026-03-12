"use client";

import { Box, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <CircularProgress size={32} />
    </Box>
  ),
});

export interface MapMarker {
  id: string;
  providerName: string;
  address?: string;
  lat: number;
  lng: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface InteractiveMapProps {
  markers: MapMarker[];
  userLocation: UserLocation | null;
  selectedProviderName?: string;
  onSelectProviderName?: (providerName: string) => void;
}

export function InteractiveMap({ markers, userLocation, selectedProviderName, onSelectProviderName }: InteractiveMapProps) {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        minHeight: { xs: 280, md: 360 },
        bgcolor: "#F3F4F6",
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <LeafletMap
        markers={markers}
        userLocation={userLocation}
        selectedProviderName={selectedProviderName}
        onSelectProviderName={onSelectProviderName}
      />
    </Box>
  );
}
