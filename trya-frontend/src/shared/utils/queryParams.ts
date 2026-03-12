export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export const buildQueryParams = (
  params: Record<string, QueryParamValue>,
  withPrefix = true
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const normalizedValue = String(value).trim();
    if (normalizedValue === "") return;

    searchParams.set(key, normalizedValue);
  });

  const queryString = searchParams.toString();
  if (!queryString) return "";

  return withPrefix ? `?${queryString}` : queryString;
};
