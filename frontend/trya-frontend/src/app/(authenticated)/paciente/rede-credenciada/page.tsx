"use client";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  LocationOff as LocationOffIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";
import { ProviderCardNew } from "./components/ProviderCardNew";
import { InteractiveMap, type MapMarker } from "./components/InteractiveMap";
import { NetworkAssistant } from "./components/NetworkAssistant";
import { FilterDialog, DISTANCE_OPTIONS } from "./components/FilterDialog";
import { networkProvidersService } from "./services/networkProvidersService";
import type { NearbyProvider } from "./types/networkProviders.types";

interface UserLocation {
  lat: number;
  lng: number;
}

export default function RedeCredenciadaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { tenant: tenantName } = useTenantAssets();

  const [mobileTab, setMobileTab] = useState<"assistant" | "network">("assistant");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceKm, setDistanceKm] = useState<number>(50);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [providers, setProviders] = useState<NearbyProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const providerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const urlSearchParamRef = useRef<string | null>(null);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  const fetchProviders = useCallback(
    async (searchText?: string) => {
      setIsSearching(true);
      setError(null);

      try {
        const result = await networkProvidersService.searchNearbyProviders({
          latitude: userLocation?.lat ?? -23.5505,
          longitude: userLocation?.lng ?? -46.6333,
          searchText,
          distanceKm,
          page: 1,
          limit: 50,
        });
        const data = result.data ?? [];
        setProviders(data);
        if (data.length > 0) {
          setSelectedProviderId(data[0].id);
        } else {
          setSelectedProviderId(undefined);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao buscar prestadores");
      } finally {
        setIsSearching(false);
      }
    },
    [userLocation, distanceKm]
  );

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      urlSearchParamRef.current = searchParam;
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (locationStatus === "granted" && userLocation) {
      if (urlSearchParamRef.current) {
        const searchParam = urlSearchParamRef.current;
        urlSearchParamRef.current = null;
        fetchProviders(searchParam);
      } else {
        fetchProviders();
      }
    }
  }, [locationStatus, userLocation, fetchProviders]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.specialty?.some((s) => s.toLowerCase().includes(q)) ||
        p.address.toLowerCase().includes(q)
    );
  }, [providers, searchQuery]);

  const markers: MapMarker[] = useMemo(() => {
    return filteredProviders.map((p) => ({
      id: p.id,
      providerName: p.name,
      address: p.address,
      lat: p.latitude,
      lng: p.longitude,
    }));
  }, [filteredProviders]);

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 3 && trimmedQuery.length > 0) {
      return;
    }
    fetchProviders(trimmedQuery || undefined);    
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length >= 3 || trimmedValue.length === 0) {
      debounceTimerRef.current = setTimeout(() => {
        fetchProviders(trimmedValue || undefined);
      }, 500);
    }
  };

  const handleAssistantSearch = (specialtyName: string) => {
    setSearchQuery(specialtyName);
    fetchProviders(specialtyName);
  };

  const onBack = () => {
    const url = getUrlWithTenant("/paciente", tenantName);
    router.push(url);
  };

  const selectedProvider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId),
    [providers, selectedProviderId]
  );

  useEffect(() => {
    if (selectedProviderId) {
      const element = providerRefs.current.get(selectedProviderId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedProviderId]);

  const currentDistanceLabel = DISTANCE_OPTIONS.find((o) => o.value === distanceKm)?.label ?? `${distanceKm} km`;

  const handleApplyFilters = (filters: { distanceKm: number }) => {
    setDistanceKm(filters.distanceKm);
  };

  const locationTooltip =
    locationStatus === "requesting"
      ? "Obtendo localização..."
      : locationStatus === "granted"
        ? "Localização ativa"
        : "Localização desativada - ative nas configurações do navegador";

  const handleSelectProvider = (name: string) => {
    const p = providers.find((pr) => pr.name === name);
    setSelectedProviderId(p?.id);
  };

  const emptyMessage = providers.length === 0
    ? "Nenhum prestador encontrado. Tente aumentar o raio de busca nos filtros."
    : "Nenhum resultado para a busca";

  // Componentes compartilhados
  const LocationStatusIcon = (
    <Tooltip title={locationTooltip} arrow>
      <IconButton
        onClick={locationStatus !== "granted" ? requestGeolocation : undefined}
        size="small"
        sx={{ width: 32, height: 32, bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}
      >
        {locationStatus === "requesting" ? (
          <CircularProgress size={16} />
        ) : locationStatus === "granted" ? (
          <LocationOnIcon sx={{ fontSize: 18, color: "success.main" }} />
        ) : (
          <LocationOffIcon sx={{ fontSize: 18, color: "error.main" }} />
        )}
      </IconButton>
    </Tooltip>
  );

  const ProvidersList = (
    <>
      {isSearching && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!isSearching && filteredProviders.length === 0 && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
            {emptyMessage}
          </Typography>
          <Button
            size="small"
            startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ fontSize: 12 }}
            variant="outlined"
            color="inherit"
          >
            Ajustar filtros
          </Button>
        </Box>
      )}

      {filteredProviders.map((provider) => (
        <Box
          key={provider.id}
          ref={(el: HTMLDivElement | null) => {
            if (el) providerRefs.current.set(provider.id, el);
            else providerRefs.current.delete(provider.id);
          }}
        >
          <ProviderCardNew
            provider={provider}
            isSelected={selectedProviderId === provider.id}
            onSelect={() => setSelectedProviderId(selectedProviderId === provider.id ? undefined : provider.id)}
          />
        </Box>
      ))}
    </>
  );

  const SearchFiltersBar = (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {LocationStatusIcon}
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {currentDistanceLabel}
        </Typography>
      </Box>
      <Button
        size="small"
        startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
        onClick={() => setFilterDialogOpen(true)}
        variant="text"
        color="inherit"
        sx={{ textTransform: "none", fontSize: 12 }}
      >
        Filtros
      </Button>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "background.default", p: { xs: 2, md: 0 } }}>
      {/* Header - Voltar */}
      <Box
        onClick={onBack}
        sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover": { opacity: 0.7 }, mb: 2 }}
      >
        <ArrowBack sx={{ fontSize: 18 }} />
        <Typography sx={{ fontSize: 14 }}>Voltar</Typography>
      </Box>

      {/* Tabs - apenas mobile */}
      <Box sx={{ display: { xs: "block", lg: "none" }, mb: 2 }}>
        <Tabs
          value={mobileTab}
          onChange={(_e, v) => setMobileTab(v)}
          textColor="inherit"
        >
          <Tab value="assistant" label="Clínicas e especialidades" />
          <Tab value="network" label="Redes credenciadas" />
        </Tabs>
      </Box>

      {/* Layout principal */}
      <Box sx={{ display: "flex", gap: 3, height: { lg: "calc(100vh - 100px)" } }}>
        {/* Coluna esquerda - Filtros + Lista */}
        <Box 
          sx={{ 
            width: { xs: "100%", lg: 480 }, 
            minWidth: { lg: 400 }, 
            flexDirection: "column", 
            gap: 2,
            display: { xs: mobileTab === "network" ? "flex" : "none", lg: "flex" },
          }}
        >
          {/* Filtros e Lista - desktop */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              borderRadius: "16px",
              border: 1,
              borderColor: "divider",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Busque clínicas ou especialidades"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ color: "grey.500", cursor: "pointer" }} onClick={handleSearch} />
                      </InputAdornment>
                    ),
                  }                    
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "grey.50" } }}
              />
              {SearchFiltersBar}
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {ProvidersList}
            </Box>
          </Paper>

          {/* Filtros e Lista - mobile na aba network */}
          <Box sx={{ display: { xs: "flex", lg: "none" }, flexDirection: "column", gap: 2 }}>
            <Paper
              elevation={0}
              sx={{ p: 2, borderRadius: "14px", border: 1, borderColor: "divider" }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Busque clínicas ou especialidades"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ color: "grey.500", cursor: "pointer" }} onClick={handleSearch} />
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "grey.50" } }}
              />
              {SearchFiltersBar}
            </Paper>

            <Paper
              elevation={0}
              sx={{ 
                borderRadius: "14px", 
                border: 1, 
                borderColor: "divider", 
                overflow: "hidden",
                maxHeight: "calc(100vh - 520px)",
              }}
            >
              <Box sx={{ overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5, maxHeight: "inherit" }}>
                {ProvidersList}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Coluna direita - Mapa + Assistente */}
        <Box 
          sx={{ 
            flex: 1, 
            minWidth: 0,
            display: { xs: mobileTab === "assistant" ? "flex" : "none", lg: "flex" },
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Mapa */}
          <Box 
            sx={{ 
              height: { xs: 280, lg: "45%" }, 
              borderRadius: { xs: "14px", lg: "16px" }, 
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <InteractiveMap
              markers={markers}
              userLocation={userLocation}
              selectedProviderName={selectedProvider?.name}
              onSelectProviderName={handleSelectProvider}
            />
          </Box>

          {/* NetworkAssistant */}
          <Box 
            sx={{ 
              flex: 1,
              minHeight: 0,
            }}
          >
            <NetworkAssistant 
              onPickSpecialty={handleAssistantSearch}
              userLocation={userLocation}
              showProviderCards={isMobile}
            />
          </Box>
        </Box>
      </Box>

      <FilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        distanceKm={distanceKm}
        onApply={handleApplyFilters}
      />

      {error && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "error.main",
            color: "white",
            px: 3,
            py: 1.5,
            borderRadius: "10px",
            boxShadow: 3,
            zIndex: 1000,
          }}
        >
          <Typography sx={{ fontSize: 13 }}>{error}</Typography>
        </Box>
      )}
    </Box>
  );
}
