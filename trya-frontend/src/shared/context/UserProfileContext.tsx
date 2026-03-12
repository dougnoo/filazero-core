"use client";

import { createContext, useContext } from "react";
import type { UserProfile } from "@/shared/services/authService";

interface UserProfileContextValue {
  userProfile: UserProfile | null;
  isDependent: boolean;
  isBeneficiary: boolean;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({
  children,
  userProfile,
}: {
  children: React.ReactNode;
  userProfile: UserProfile | null;
}) {
  const role = userProfile?.role?.toUpperCase();
  const isDependent = role === "DEPENDENT";
  const isBeneficiary = role === "BENEFICIARY";

  return (
    <UserProfileContext.Provider value={{ userProfile, isDependent, isBeneficiary }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
}
