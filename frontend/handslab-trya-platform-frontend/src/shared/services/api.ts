type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiRequestOptions {
  method: HttpMethod;
  body?: unknown;
}

let refreshInProgress = false;
let refreshPromise: Promise<void> | null = null;
let refreshFailed = false;

const request = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions,
  messageError: string | null = "Erro ao realizar a requisição!",
  isBlob = false,
): Promise<T> => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const isNoAuthenticationEndpoint = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/auth/login",
    "/auth/refresh",
  ].includes(endpoint);

  // Pega o token do localStorage (mesma chave que o authService)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token")
      : null;

  const headers = new Headers();

  // Só adiciona Content-Type para JSON, não para FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Validação e adição do token
  if (!isNoAuthenticationEndpoint) {
    if (token && token !== "undefined" && token !== "null") {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      // Se não tem token e não é endpoint público, redireciona para login
      if (typeof window !== "undefined" && endpoint !== "/api/auth/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      }
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });

  if (response.status === 204) return [] as T;

  if (response.status === 401) {
    // Se já tentou refresh e falhou, redireciona imediatamente
    if (refreshFailed) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }

    // Token expirado, tentar refresh apenas uma vez
    if (!isNoAuthenticationEndpoint && !refreshInProgress) {
      refreshInProgress = true;

      refreshPromise = (async () => {
        try {
          await refreshToken();
          refreshInProgress = false;
          refreshFailed = false;
        } catch (error) {
          refreshInProgress = false;
          refreshFailed = true;

          // Redirecionar para login
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");

            setTimeout(() => {
              window.location.href = "/login";
            }, 100);
          }
          throw error;
        }
      })();

      if (refreshPromise) {
        await refreshPromise;
        // Tentar novamente com o novo token
        return request(endpoint, options, messageError, isBlob);
      }
    }

    // Se já está em refresh, aguarda
    if (refreshInProgress && refreshPromise) {
      await refreshPromise;
      return request(endpoint, options, messageError, isBlob);
    }
  }

  if (response.status === 403) {
    throw new Error("Você não tem permissão de acesso!");
  }

  if (!response.ok) {
    const text = await response.text();
    let errorData: unknown = {};

    try {
      errorData = JSON.parse(text);
    } catch {
    }

    if (errorData && typeof errorData === "object" && "errors" in errorData) {
      const errors = (errorData as { errors: Record<string, unknown> }).errors;
      const firstErrorMessage = Object.values(errors).flat()[0]?.toString();
      throw new Error(firstErrorMessage);
    }

    // Verifica se tem campo "message" diretamente no objeto de erro (prioridade)
    // Isso deve vir antes da verificação de "error" para garantir que a mensagem do backend seja usada
    if (errorData && typeof errorData === "object" && "message" in errorData) {
      const message = (errorData as { message: string }).message;
      if (typeof message === "string" && message.trim()) {
        throw new Error(message);
      }
    }

    if (errorData && typeof errorData === "object" && "error" in errorData) {
      const error = (errorData as { error: string[] | string }).error;
      // Se error é um array, pega o primeiro item; se é string, usa diretamente
      if (Array.isArray(error)) {
        throw new Error(messageError || error[0]);
      } else if (typeof error === "string") {
        throw new Error(messageError || error);
      }
    }

    throw new Error(messageError || String(errorData));
  }

  if (isBlob) {
    const data = await response?.blob();
    const result = {
      file: data,
      fileName: response?.headers?.get("Filename") as string,
    };
    return result as unknown as T;
  }

  const data = await response.text();
  const parsed = data ? JSON.parse(data) : {};
  return parsed as T;
};

const refreshToken = async () => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("refreshToken") ||
        localStorage.getItem("refresh_token")
      : null;

  if (!refreshToken) {
    throw new Error("Refresh token não encontrado");
  }

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refreshToken }),
  });

  if (response.status === 401 || response.status === 400) {
    if (typeof window !== "undefined") {
      // Remove ambas as chaves (compatibilidade)
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    throw new Error("Sua sessão foi expirada!");
  }

  const data = await response.json();

  if (typeof window !== "undefined") {
    // Salva em ambas as chaves para compatibilidade com authService
    const accessToken = data.accessToken || data.token;
    const refreshTokenValue = data.refreshToken;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("auth_token", accessToken); // fallback
    }
    if (refreshTokenValue) {
      localStorage.setItem("refreshToken", refreshTokenValue);
      localStorage.setItem("refresh_token", refreshTokenValue); // fallback
    }
  }

  return data;
};

const get = <T = unknown>(
  endpoint: string,
  messageError?: string | null,
  isBlob = false,
): Promise<T> => {
  return request(endpoint, { method: "GET" }, messageError, isBlob);
};

const post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: "POST", body }, messageError);
};

const put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: "PUT", body }, messageError);
};

const patch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: "PATCH", body }, messageError);
};

const del = <T = unknown>(
  endpoint: string,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: "DELETE" }, messageError);
};

const delWithBody = <T = unknown>(
  endpoint: string,
  body: unknown,
  messageError?: string | null,
): Promise<T> => {
  return request(endpoint, { method: "DELETE", body }, messageError);
};

export const api = {
  get: get as <T = unknown>(
    endpoint: string,
    messageError?: string | null,
    isBlob?: boolean,
  ) => Promise<T>,
  post: post as <T = unknown>(
    endpoint: string,
    body?: unknown,
    messageError?: string | null,
  ) => Promise<T>,
  del: del as <T = unknown>(
    endpoint: string,
    messageError?: string | null,
  ) => Promise<T>,
  put: put as <T = unknown>(
    endpoint: string,
    body?: unknown,
    messageError?: string | null,
  ) => Promise<T>,
  patch: patch as <T = unknown>(
    endpoint: string,
    body?: unknown,
    messageError?: string | null,
  ) => Promise<T>,
  delWithBody: delWithBody as <T = unknown>(
    endpoint: string,
    body: unknown,
    messageError?: string | null,
  ) => Promise<T>,
};
