"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = { id: string; productId?: string; name: string; price: number; image?: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  toast: string | null;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gharmai_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("gharmai_cart", JSON.stringify(items)); } catch {}
  }, [items]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function add(item: Omit<CartItem, "qty">) {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`Added ${item.name}`);
  }
  function remove(id: string) { setItems((p) => p.filter((i) => i.id !== id)); }
  function changeQty(id: string, delta: number) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  }
  function clear() { setItems([]); }

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, changeQty, clear, count, subtotal, open, setOpen, toast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
