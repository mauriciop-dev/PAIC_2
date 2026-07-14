import { adminInsforge } from "@/lib/insforge";

export type FeatureFlags = {
  ai_chat: boolean;
  multi_copropiedad: boolean;
  subscription: boolean;
};

export const DEFAULT_FLAGS: FeatureFlags = {
  ai_chat: true,
  multi_copropiedad: true,
  subscription: true,
};

let _flags: FeatureFlags | null = null;

export function getFeatureFlags(): FeatureFlags {
  if (!_flags) {
    try {
      if (process.env.NEXT_PUBLIC_FEATURE_FLAGS) {
        _flags = JSON.parse(process.env.NEXT_PUBLIC_FEATURE_FLAGS);
      }
    } catch {}
    _flags = _flags ?? DEFAULT_FLAGS;
  }
  return _flags!;
}

export async function getPublicSettings() {
  const { data } = await adminInsforge!.database
    .from("ia_config")
    .select("*")
    .single();
  return data;
}
