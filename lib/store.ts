import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((s) => {
          const exists = s.items.find((i) => i.id === item.id);
          if (exists)
            return {
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          return { items: [...s.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: qty } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "dos-cart",
      /** Avoid SSR/client HTML mismatch: rehydrate from localStorage after mount (see CartRehydrate). */
      skipHydration: true,
    }
  )
);

type FavoritesStore = {
  items: Product[];
  addItem: (item: Product) => void;
  removeItem: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          if (s.items.find((i) => i.id === item.id)) return s;
          return { items: [...s.items, item] };
        }),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      isFavorite: (id) => !!get().items.find((i) => i.id === id),
    }),
    {
      name: "dos-favorites",
      skipHydration: true,
    }
  )
);
