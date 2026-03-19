"use client";

import { useState } from "react";

export default function UnloadStockForm({
  variantId,
  sizes,
}: {
  variantId: number;
  sizes: { sizeId: number; size: string }[];
}) {
  const [quantity, setQuantity] = useState<number>(0);
  const [sizeId, setSizeId] = useState<number>(sizes[0]?.sizeId ?? 0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!sizeId || quantity <= 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/stock/unload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          sizeId,
          quantity,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Errore scarico");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Errore scarico");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6 bg-white shadow-sm space-y-4"
    >
      <h3 className="text-lg font-semibold">Scarico merce</h3>

      <select
        className="w-full rounded-lg border p-3"
        value={sizeId}
        onChange={(e) => setSizeId(Number(e.target.value))}
      >
        {sizes.map((s) => (
          <option key={s.sizeId} value={s.sizeId}>
            {s.size}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={1}
        className="w-full rounded-lg border p-3"
        placeholder="Quantità"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-red-600 p-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? "Scarico..." : "Scarica merce"}
      </button>
    </form>
  );
}