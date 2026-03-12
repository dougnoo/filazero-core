"use client";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Navigation as NavigationIcon,
  Phone as PhoneIcon,
  Place as PlaceIcon,
  Star as StarIcon,
  WhatsApp as WhatsAppIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useState, useMemo } from "react";
import { 
  type NearbyProvider, 
  calculateTravelTime, 
  isPeakHour 
} from "../types/networkProviders.types";

interface ProviderCardNewProps {
  provider: NearbyProvider;
  isSelected?: boolean;
  onSelect?: () => void;
}

const MAX_VISIBLE_SPECIALTIES = 3;

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1).replace(".", ",")}km`;
};

const formatTravelTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const formatRating = (rating: number): string => rating?.toFixed(1).replace(".", ",");

const formatReviewCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(".", ",")}k avaliações`;
  return `${count} avaliações`;
};

function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<StarIcon key={i} sx={{ fontSize: size, color: "#FBBF24" }} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Box key={i} sx={{ position: "relative", display: "inline-flex" }}>
          <StarIcon sx={{ fontSize: size, color: "#E5E7EB" }} />
          <Box sx={{ position: "absolute", left: 0, top: 0, width: "50%", overflow: "hidden" }}>
            <StarIcon sx={{ fontSize: size, color: "#FBBF24" }} />
          </Box>
        </Box>
      );
    } else {
      stars.push(<StarIcon key={i} sx={{ fontSize: size, color: "#E5E7EB" }} />);
    }
  }

  return <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>{stars}</Box>;
}

function GoogleRatingBadge({ rating, totalReviews }: { rating: number; totalReviews: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
        {formatRating(rating)}
      </Typography>
      <RatingStars rating={rating} size={14} />
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {formatReviewCount(totalReviews)} via{" "}
        <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color: "#4285F4" }}>
          Google
        </Typography>
      </Typography>
    </Box>
  );
}

function BusinessHoursSection({ weekdayText }: { weekdayText: string[] }) {
  const [expanded, setExpanded] = useState(false);

  const status = useMemo(() => {
    const is24Hours = weekdayText.some(h => 
      h.toLowerCase().includes("24 horas") || 
      h.toLowerCase().includes("atendimento 24")
    );
    
    if (is24Hours) {
      return { isOpen: true, is24Hours: true };
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    const dayNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    const todayName = dayNames[currentDay];
    
    const todayHours = weekdayText.find(h => h.toLowerCase().startsWith(todayName));
    
    if (!todayHours || todayHours.toLowerCase().includes("fechado")) {
      for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDay + i) % 7;
        const nextDayName = dayNames[nextDay];
        const nextHours = weekdayText.find(h => h.toLowerCase().startsWith(nextDayName));
        if (nextHours && !nextHours.toLowerCase().includes("fechado")) {
          const match = nextHours.match(/(\d{2}:\d{2})/);
          return { isOpen: false, opensAt: match ? `${nextDayName.slice(0, 3)} ${match[1]}` : undefined };
        }
      }
      return { isOpen: false };
    }

    const hoursMatch = todayHours.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
    if (hoursMatch) {
      const [, openTime, closeTime] = hoursMatch;
      if (currentTime >= openTime && currentTime < closeTime) {
        return { isOpen: true, closesAt: closeTime };
      }
      if (currentTime < openTime) {
        return { isOpen: false, opensAt: openTime };
      }
    }

    return { isOpen: false };
  }, [weekdayText]);

  const getStatusText = () => {
    if (status.is24Hours) return "Atendimento 24 horas";
    if (status.isOpen && status.closesAt) return `Fecha ${status.closesAt}`;
    if (!status.isOpen && status.opensAt) return `Abre ${status.opensAt}`;
    return "Horários indisponíveis";
  };

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
        Horário de funcionamento:
      </Typography>
      <Box
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        sx={{ cursor: "pointer" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: status.isOpen ? "#059669" : "#DC2626" }}>
            {status.isOpen ? "Aberto" : "Fechado"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>•</Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {getStatusText()}
          </Typography>
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          {weekdayText.map((text, idx) => (
            <Typography key={idx} sx={{ fontSize: 12, color: "text.primary", py: 0.25 }}>
              {text}
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function NoRatingMessage() {
  return (
    <Typography sx={{ fontSize: 12, color: "text.secondary", fontStyle: "italic" }}>
      Este prestador ainda não possui avaliações públicas no Google.
    </Typography>
  );
}

function TravelTimeInfo({ distanceKm }: { distanceKm: number }) {
  const peakHour = useMemo(() => isPeakHour(), []);
  const travelTime = useMemo(() => calculateTravelTime(distanceKm, peakHour), [distanceKm, peakHour]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <AccessTimeIcon sx={{ fontSize: 16, color: "grey.700" }} />
        <Typography sx={{ fontSize: 12, color: "grey.700" }}>
          ~{formatTravelTime(travelTime)} de carro
        </Typography>
      </Box>
      {peakHour && (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: "#FEF3C7",
            color: "#92400E",
            px: 1,
            py: 0.25,
            borderRadius: "4px",
          }}
        >
          <WarningIcon sx={{ fontSize: 12 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 500 }}>
            Horário de pico
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export function ProviderCardNew({ provider, isSelected, onSelect }: ProviderCardNewProps) {
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const specialties = provider.specialty ?? [];
  const hasMoreSpecialties = specialties.length > MAX_VISIBLE_SPECIALTIES;
  const visibleSpecialties = showAllSpecialties ? specialties : specialties.slice(0, MAX_VISIBLE_SPECIALTIES);

  const fullAddress = [
    provider.address,
    provider.neighborhood ? `- ${provider.neighborhood}` : null,
    `${provider.city} - ${provider.state}, ${provider.zipCode}`,
  ]
    .filter(Boolean)
    .join(" ");

  const phones: string[] = [];
  if (provider.phone) phones.push(provider.phone);
  if (provider.phone2 && provider.phone2 !== provider.phone) phones.push(provider.phone2);

  const initials = provider.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hasGoogleRating = provider.googleRating != null && provider.googleUserRatingsTotal != null;
  const hasBusinessHours = provider.googleWeekdayText && provider.googleWeekdayText.length > 0;

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (provider.googlePlaceUrl) {
      window.open(provider.googlePlaceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const q = encodeURIComponent(`${provider.address} ${provider.city} ${provider.state}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener,noreferrer");
  };

  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (!isMobile) return;
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`tel:${cleanPhone}`, "_self");
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!provider.whatsapp) return;
    const cleanPhone = provider.whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      onClick={onSelect}
      role="button"
      sx={{
        p: 2,
        borderRadius: "12px",
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: "background.paper",
        cursor: "pointer",
        transition: "all 150ms ease",
        boxShadow: isSelected ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
        "&:hover": {
          borderColor: isSelected ? "primary.main" : "primary.light",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: "secondary.light", color: "secondary.dark", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mb: 0.5 }}>
            {provider.name}
          </Typography>
          {hasGoogleRating ? (
            <GoogleRatingBadge rating={provider.googleRating!} totalReviews={provider.googleUserRatingsTotal!} />
          ) : (
            <NoRatingMessage />
          )}
        </Box>
      </Box>

      {hasBusinessHours && <BusinessHoursSection weekdayText={provider.googleWeekdayText!} />}

      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
          <NavigationIcon sx={{ fontSize: 16, color: "grey.700", transform: "rotate(45deg)" }} />
          <Typography sx={{ fontSize: 12, color: "grey.700" }}>{formatDistance(provider.distance)} de distância</Typography>
        </Box>
        <Box sx={{ ml: 3 }}>
          <TravelTimeInfo distanceKm={provider.distance} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
        <PlaceIcon sx={{ fontSize: 16, color: "grey.700", mt: "1px", flexShrink: 0 }} />
        <Typography sx={{ fontSize: 12, color: "grey.700", lineHeight: 1.5 }}>{fullAddress}</Typography>
      </Box>

      {phones.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: provider.whatsapp ? 1.5 : 2 }}>
          <PhoneIcon sx={{ fontSize: 16, color: "grey.700" }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {phones.map((phone, idx) => (
              <Typography
                key={idx}
                component="span"
                onClick={(e) => handlePhoneClick(e, phone)}
                sx={{
                  fontSize: 12,
                  color: "grey.700",
                  cursor: isMobile ? "pointer" : "default",
                  textDecoration: isMobile ? "underline" : "none",
                  "&:hover": isMobile ? { color: "primary.main" } : {},
                }}
              >
                {phone}
                {idx < phones.length - 1 ? " /" : ""}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {provider.whatsapp && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <WhatsAppIcon sx={{ fontSize: 16, color: "#25D366" }} />
          <Typography
            component="span"
            onClick={handleWhatsAppClick}
            sx={{ fontSize: 12, color: "grey.700", fontWeight: 500, cursor: "pointer", textDecoration: "underline", "&:hover": { color: "#25D366" } }}
          >
            {provider.whatsapp}
          </Typography>
        </Box>
      )}

      {specialties.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center", mb: 2 }}>
          {visibleSpecialties.map((spec, idx) => (
            <Chip
              key={idx}
              label={spec}
              size="small"
              variant="outlined"
              sx={{ borderColor: "divider", color: "grey.700", fontWeight: 500, fontSize: 11, height: 26, borderRadius: "6px" }}
            />
          ))}
          {hasMoreSpecialties && (
            <Typography
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                setShowAllSpecialties(!showAllSpecialties);
              }}
              sx={{ fontSize: 11, color: "grey.700", cursor: "pointer", textDecoration: "underline" }}
            >
              {showAllSpecialties ? "Ver menos" : "Ver mais"}
            </Typography>
          )}
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={handleNavigate}
        startIcon={<NavigationIcon sx={{ transform: "rotate(45deg)" }} />}
        sx={{ borderRadius: "8px", py: 1.25, textTransform: "none", fontWeight: 600 }}
      >
        Ir até a clínica
      </Button>
    </Box>
  );
}
