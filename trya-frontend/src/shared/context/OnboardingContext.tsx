"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authService, type UserProfile } from "@/shared/services/authService";

interface OnboardingContextType {
  isOnboarded: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('[OnboardingContext] Error fetching profile:', error);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  const completeOnboarding = useCallback(async () => {
    // Após completar o onboarding via API, atualiza o perfil
    await refreshProfile();
  }, [refreshProfile]);

  const isNonPatientRole = (role?: string | null, groups?: string[]) => {
    if (!role && !groups?.length) return false;
    const r = (role ?? '').toUpperCase();
    if (['SUPER_ADMIN', 'ADMIN', 'HR', 'ADMIN_RH', 'DOCTOR'].includes(r)) return true;
    if (groups?.some((g) => ['SUPER_ADMIN', 'ADMIN', 'HR', 'ADMIN_RH', 'DOCTOR'].includes(g))) return true;
    return false;
  };

  const isOnboarded =
    Boolean(userProfile?.onboardedAt) ||
    isNonPatientRole(userProfile?.role, userProfile?.groups);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarded,
        isLoading,
        userProfile,
        refreshProfile,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
