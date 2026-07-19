"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns false during SSR and the first client render, true after hydration.
 * Uses useSyncExternalStore (no setState-in-effect) so it satisfies the React
 * compiler lint rules while safely gating localStorage-backed state (cart).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
