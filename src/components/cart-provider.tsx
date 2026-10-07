"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EMPTY_CART, type CartPayload } from "@/lib/types";

type Toast = { id: number; title: string; body?: string; image?: string };

type CartContextValue = {
  cart: CartPayload;
  isOpen: boolean;
  isBusy: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: {
    productId: number;
    size: string;
    quantity?: number;
    name?: string;
    image?: string;
  }) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refresh: () => Promise<void>;
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartPayload>(EMPTY_CART);
  const [isOpen, setOpen] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { ...toast, id }].slice(-3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;
      setCart((await res.json()) as CartPayload);
    } catch {
      /* offline-safe */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    async ({ productId, size, quantity = 1, name, image }) => {
      setBusy(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size, quantity }),
        });
        if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Could not add to bag."); }
        if (res.ok) {
          setCart((await res.json()) as CartPayload);
          pushToast({ title: "Added to bag", body: name ? `${name} · ${size}` : undefined, image });
          setOpen(true);
        }
      } catch (error) {
        pushToast({ title: "Could not update bag", body: error instanceof Error ? error.message : "Please check your connection and retry." });
      } finally {
        setBusy(false);
      }
    },
    [pushToast],
  );

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    setBusy(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Could not update bag."); }
      setCart((await res.json()) as CartPayload);
    } catch (error) {
      pushToast({ title: "Could not update bag", body: error instanceof Error ? error.message : "Please check your connection and retry." });
    } finally {
      setBusy(false);
    }
  }, [pushToast]);

  const removeItem = useCallback(async (itemId: number) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Could not update bag."); }
      setCart((await res.json()) as CartPayload);
    } catch (error) {
      pushToast({ title: "Could not update bag", body: error instanceof Error ? error.message : "Please check your connection and retry." });
    } finally {
      setBusy(false);
    }
  }, [pushToast]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      isBusy,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem,
      updateItem,
      removeItem,
      refresh,
      toasts,
      pushToast,
    }),
    [cart, isOpen, isBusy, addItem, updateItem, removeItem, refresh, toasts, pushToast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
