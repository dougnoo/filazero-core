/**
 * usePlatformAuth Hook
 * 
 * React hook for managing Platform API authentication state.
 * Used by the medical module for authentication.
 */

import { useState, useEffect } from 'react';
import { platformAuthService, UserProfile, SignInRequest } from '../services/platformAuthService';

export function usePlatformAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const authenticated = platformAuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          const userProfile = await platformAuthService.getCurrentUser();
          setUser(userProfile);
        } catch (error) {
          // If fetching profile fails, user might not be authenticated
          setIsAuthenticated(false);
          platformAuthService.logout();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (credentials: SignInRequest) => {
    try {
      const response = await platformAuthService.signIn(credentials);
      setIsAuthenticated(true);
      
      // Load user profile after sign in
      try {
        const userProfile = await platformAuthService.getCurrentUser();
        setUser(userProfile);
      } catch (error) {
        // Profile fetch failed, but authentication succeeded
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    platformAuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userProfile = await platformAuthService.getCurrentUser();
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    logout,
    refreshUser,
  };
}
