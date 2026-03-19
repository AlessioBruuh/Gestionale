"use client";

import { useState } from "react";

export default function LoadStockForm({
  variantId,
  sizes,
}: {
  variantId: number;
  sizes: { sizeId: number; size: string }[];
}) {
  const [quantity, setQuantity] = useState(0);
  const [sizeId, setSizeId] = useState<number>(sizes[0]?.sizeId);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    await fetch("/api/stock/load", {
      method: "POST",
      body: JSON.stringify({
        variantId,
        sizeId,
        quantity: Number(quantity),
      }),
    });

    setLoading(false);
    location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6 bg-white shadow-sm space-y-4"
    >
      <h3 className="font-semibold text-lg">Carico merce</h3>

      <select
        className="border rounded-lg p-2 w-full"
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
        className="border rounded-lg p-2 w-full"
        placeholder="Quantità"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white rounded-xl p-3 font-semibold hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Caricamento..." : "Carica merce"}
      </button>
    </form>
  );
}