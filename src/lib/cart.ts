import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  color: string;
  quantity: number;
  slug: string;
  gradient: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, color: string) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.color === item.color
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.color === item.color
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
            isOpen: true,
          };
        }),

      removeItem: (productId, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.color === color)
          ),
        })),

      updateQuantity: (productId, color, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.productId === productId && i.color === color)
                )
              : state.items.map((i) =>
                  i.productId === productId && i.color === color
                    ? { ...i, quantity }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "lace-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
