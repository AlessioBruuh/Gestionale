"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CartItem = {
  stockId: number;
  variantId: number;
  sizeId: number;
  barcode: string;
  code: string;
  article: string;
  color: string;
  size: string;
  salePrice: number;
  quantity: number;
};

export default function PosClient() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.salePrice * item.quantity,
      0
    );
  }, [cart]);

  async function handleScan() {
    const value = barcode.trim();
    if (!value) return;

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `/api/pos/find-by-barcode?barcode=${encodeURIComponent(value)}`
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Errore ricerca prodotto");
        return;
      }

      if (!data.found) {
        setMessage("Barcode non trovato");
        return;
      }

      if (data.quantity <= 0) {
        setMessage("Prodotto esaurito");
        return;
      }

      setCart((prev) => {
        const existing = prev.find((item) => item.stockId === data.stockId);

        if (existing) {
          return prev.map((item) =>
            item.stockId === data.stockId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [
          ...prev,
          {
            stockId: data.stockId,
            variantId: data.variantId,
            sizeId: data.sizeId,
            barcode: data.barcode,
            code: data.code,
            article: data.article,
            color: data.color,
            size: data.size,
            salePrice: data.salePrice ?? 0,
            quantity: 1,
          },
        ];
      });

      setBarcode("");
      setMessage(`Aggiunto: ${data.article} - ${data.color} - ${data.size}`);
    } catch (error) {
      console.error(error);
      setMessage("Errore scansione barcode");
    } finally {
      setLoading(false);
    }
  }

  function increaseQuantity(stockId: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.stockId === stockId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(stockId: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.stockId === stockId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(stockId: number) {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      setMessage("Carrello vuoto");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            stockId: item.stockId,
            variantId: item.variantId,
            sizeId: item.sizeId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Errore checkout");
        return;
      }

      setCart([]);
      setMessage("Vendita completata con successo");
    } catch (error) {
      console.error(error);
      setMessage("Errore checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Vendita</p>
            <h1 className="text-3xl font-bold text-gray-900">POS</h1>
          </div>

          <div className="flex gap-3">
            <Link
              href="/inventory"
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Magazzino
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Scansione prodotto
              </h2>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleScan();
                    }
                  }}
                  placeholder="Scansiona barcode"
                  autoFocus
                  className="w-full rounded-2xl border-2 border-black bg-white px-4 py-4 text-lg outline-none"
                />

                <button
                  type="button"
                  onClick={handleScan}
                  disabled={loading}
                  className="rounded-2xl bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  Aggiungi
                </button>
              </div>

              {message && (
                <div className="mt-4 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-800">
                  {message}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Carrello
              </h2>

              {cart.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nessun prodotto nel carrello.
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.stockId}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 p-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.article}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.code} • {item.color} • {item.size}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          € {item.salePrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.stockId)}
                          className="rounded-xl border border-gray-300 px-3 py-2"
                        >
                          -
                        </button>

                        <span className="min-w-[32px] text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.stockId)}
                          className="rounded-xl border border-gray-300 px-3 py-2"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item.stockId)}
                          className="rounded-xl bg-red-600 px-3 py-2 text-white"
                        >
                          x
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Riepilogo</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Articoli</span>
                <span className="font-semibold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Totale</span>
                <span>€ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="mt-6 w-full rounded-2xl bg-green-600 px-4 py-4 text-base font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              Completa vendita
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}