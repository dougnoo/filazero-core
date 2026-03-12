// src/shared/theme/mergeRole.ts
import type { ClientTheme } from "@/shared/types/theme";
import type { DeepPartial } from "@/shared/types/deep-partial";
import { ROLE_OVERRIDES, RoleSlug } from "../role";

/* --- deepMerge tipado (ok manter o seu se preferir) --- */
type PlainObject = Record<string, unknown>;
const isPlainObject = (v: unknown): v is PlainObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function deepMergeUnknown(base: unknown, patch: unknown): unknown {
  if (patch === undefined) return base;

  if (isPlainObject(base) && isPlainObject(patch)) {
    const result: PlainObject = { ...(base as PlainObject) };
    for (const [k, pv] of Object.entries(patch)) {
      if (pv === undefined) continue;
      const bv = (base as PlainObject)[k];
      result[k] = deepMergeUnknown(bv, pv);
    }
    return result;
  }

  if (Array.isArray(base) && Array.isArray(patch)) {
    return [...patch];
  }

  return patch;
}

export function deepMerge<T>(base: T, patch?: DeepPartial<T>): T {
  return deepMergeUnknown(base, patch) as T;
}

/* --- AQUI está o que faltava --- */
export function applyRoleToTheme(base: ClientTheme, role: RoleSlug): ClientTheme {
  const patch = ROLE_OVERRIDES[role]; // Partial<ClientTheme>
  return deepMerge(base, patch);
}
