"use client";

import { useState } from "react";

export default function InventoryForm({
  variantId,
  sizes,
}: {
  variantId: number;
  sizes: { sizeId: number; size: string; quantity: number }[];
}) {
  const [sizeId, setSizeId] = useState<number>(sizes[0]?.sizeId ?? 0);
  const [countedQuantity, setCountedQuantity] = useState<number>(
    sizes[0]?.quantity ?? 0
  );
  const [loading, setLoading] = useState(false);

  const selectedSize = sizes.find((s) => s.sizeId === sizeId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!sizeId || countedQuantity < 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/stock/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          sizeId,
          countedQuantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Errore inventario");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Errore inventario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6 bg-white shadow-sm space-y-4"
    >
      <h3 className="text-lg font-semibold">Inventario</h3>

      <select
        className="w-full rounded-lg border p-3"
        value={sizeId}
        onChange={(e) => {
          const newSizeId = Number(e.target.value);
          setSizeId(newSizeId);

          const found = sizes.find((s) => s.sizeId === newSizeId);
          setCountedQuantity(found?.quantity ?? 0);
        }}
      >
        {sizes.map((s) => (
          <option key={s.sizeId} value={s.sizeId}>
            {s.size}
          </option>
        ))}
      </select>

      <div className="rounded-xl bg-gray-50 p-4 text-sm">
        <p>
          Quantità a sistema:{" "}
          <span className="font-semibold">{selectedSize?.quantity ?? 0}</span>
        </p>
      </div>

      <input
        type="number"
        min={0}
        className="w-full rounded-lg border p-3"
        placeholder="Quantità contata"
        value={countedQuantity}
        onChange={(e) => setCountedQuantity(Number(e.target.value))}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Salvataggio..." : "Salva inventario"}
      </button>
    </form>
  );
}