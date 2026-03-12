/**
 * Platform API Client
 * 
 * HTTP client for the Platform API used by the medical module.
 * Handles authentication with Bearer tokens stored in localStorage.
 */

import { PLATFORM_API_BASE_URL, PLATFORM_STORAGE_KEYS } from '../config/platformApi.config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface PlatformApiRequestOptions {
  method: HttpMethod;
  body?: unknown;
}

/**
 * Core request method for Platform API
 * Automatically includes Bearer token from localStorage
 * Handles common HTTP errors (401, 403, 404, 400)
 */
const request = async <T = unknown>(
  endpoint: string,
  options: PlatformApiRequestOptions,
  messageError: string | null = 'Erro ao realizar a requisição!',
): Promise<T> => {
  const isNoAuthenticationEndpoint = [
    '/auth/sign-in',
    '/auth/verify-otp',
    '/auth/complete-new-password',
    '/auth/forgot-password',
    '/auth/confirm-forgot-password',
  ].includes(endpoint);

  // Get platform token from localStorage
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(PLATFORM_STORAGE_KEYS.ACCESS_TOKEN)
      : null;

  const headers = new Headers();

  // Set Content-Type for JSON requests
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Add Authorization header if token exists and endpoint requires auth
  if (!isNoAuthenticationEndpoint) {
    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      // No token and requires auth - redirect to medical login
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/medico/login';
        }, 500);
      }
    }
  }

  const response = await fetch(`${PLATFORM_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });

  // Handle 204 No Content
  if (response.status === 204) return [] as T;

  // Handle 401 Unauthorized - redirect to medical login
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PLATFORM_STORAGE_KEYS.ACCESS_TOKEN);
      setTimeout(() => {
        window.location.href = '/medico/login';
      }, 100);
    }
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    throw new Error('Você não tem permissão de acesso!');
  }

  // Handle 404 Not Found
  if (response.status === 404) {
    throw new Error('Recurso não encontrado!');
  }

  // Handle other errors
  if (!response.ok) {
    const text = await response.text();
    let errorData: unknown = {};

    try {
      errorData = JSON.parse(text);
    } catch {
      // If parsing fails, use text as error
    }

    // Check for validation errors
    if (errorData && typeof errorData === 'object' && 'errors' in errorData) {
      const errors = (errorData as { errors: Record<string, unknown> }).errors;
      const firstErrorMessage = Object.values(errors).flat()[0]?.toString();
      throw new Error(firstErrorMessage);
    }

    // Check for message field (priority)
    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      const message = (errorData as { message: string }).message;
      if (typeof message === 'string' && message.trim()) {
        throw new Error(message);
      }
    }

    // Check for error field
    if (errorData && typeof errorData === 'object' && 'error' in errorData) {
      const error = (errorData as { error: string[] | string }).error;
      if (Array.isArray(error)) {
        throw new Error(messageError || error[0]);
      } else if (typeof error === 'string') {
        throw new Error(messageError || error);
      }
    }

    throw new Error(messageError || String(errorData));
  }

  const data = await response.text();
  const parsed = data ? JSON.parse(data) : {};
  return parsed as T;
};

/**
 * HTTP GET request
 */
const get = <T = unknown>(
  endpoint: string,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: 'GET' }, messageError);
};

/**
 * HTTP POST request
 */
const post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: 'POST', body }, messageError);
};

/**
 * HTTP PUT request
 */
const put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: 'PUT', body }, messageError);
};

/**
 * HTTP PATCH request
 */
const patch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: 'PATCH', body }, messageError);
};

/**
 * HTTP DELETE request
 */
const del = <T = unknown>(
  endpoint: string,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: 'DELETE' }, messageError);
};

/**
 * Platform API client
 * Provides HTTP methods for interacting with the Platform API
 */
export const platformApi = {
  get,
  post,
  put,
  patch,
  delete: del,
};
