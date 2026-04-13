"use client";

import { useEffect } from "react";
import { useCart, useFavorites } from "@/lib/store";

/** Loads persisted cart and favorites from localStorage after the first paint so SSR HTML matches the client. */
export function CartRehydrate() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useFavorites.persist.rehydrate();
  }, []);
  return null;
}
