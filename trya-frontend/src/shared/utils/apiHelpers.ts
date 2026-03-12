const DEFAULT_ARRAY_KEYS = ["data", "items"];

export const normalizeArrayResponse = <T>(
  response: unknown,
  arrayKeys: string[] = DEFAULT_ARRAY_KEYS
): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  for (const key of arrayKeys) {
    const value = (response as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
};
