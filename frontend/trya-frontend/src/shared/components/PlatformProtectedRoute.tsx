/**
 * PlatformProtectedRoute Component
 * 
 * Protected route wrapper for the medical module.
 * Uses Platform API authentication to verify access.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { platformAuthService } from '../services/platformAuthService';

interface PlatformProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function PlatformProtectedRoute({ 
  children, 
  redirectTo = '/medico/login' 
}: PlatformProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = platformAuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          // Clear invalid tokens
          platformAuthService.logout();
          router.push(redirectTo);
        }
      } catch (error) {
        platformAuthService.logout();
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (already redirected)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render content
  return <>{children}</>;
}
