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

/** Max characters accepted for a gift message (matches checkout sanitizer). */
export const GIFT_MESSAGE_MAX = 250;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Order-level gift intent — surfaced at checkout, not per item. */
  isGift: boolean;
  giftMessage: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, color: string) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  setIsGift: (isGift: boolean) => void;
  setGiftMessage: (message: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isGift: false,
      giftMessage: "",

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

      setIsGift: (isGift) =>
        set((state) => ({
          isGift,
          // Drop any message when gifting is turned off so we never send a
          // stale note to checkout.
          giftMessage: isGift ? state.giftMessage : "",
        })),

      setGiftMessage: (message) =>
        set({ giftMessage: message.slice(0, GIFT_MESSAGE_MAX) }),

      clearCart: () => set({ items: [], isGift: false, giftMessage: "" }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "lace-cart",
      partialize: (state) => ({
        items: state.items,
        isGift: state.isGift,
        giftMessage: state.giftMessage,
      }),
    }
  )
);
