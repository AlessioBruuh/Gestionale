"use client";

import { useState } from "react";

type StockRow = {
  stockId: number;
  sizeId: number;
  size: string;
  quantity: number;
  minQuantity: number;
  barcode: string;
};

export default function StockBarcodeManager({
  rows,
}: {
  rows: StockRow[];
}) {
  const [values, setValues] = useState<Record<number, string>>(
    Object.fromEntries(rows.map((row) => [row.stockId, row.barcode || ""]))
  );

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function saveBarcode(stockId: number) {
    try {
      setLoadingId(stockId);
      setMessage("");

      const res = await fetch("/api/stock/update-barcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockId,
          barcode: values[stockId] ?? "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Errore salvataggio barcode");
        return;
      }

      setMessage("Barcode salvato con successo.");
    } catch (error) {
      console.error(error);
      setMessage("Errore salvataggio barcode");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Barcode per taglia</h2>
        <p className="mt-1 text-sm text-gray-500">
          Assegna un barcode specifico a ogni taglia.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {message}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Taglia
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Quantità
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Barcode
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Azione
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.stockId} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {row.size}
                </td>

                <td className="px-4 py-3 text-center font-semibold text-gray-800">
                  {row.quantity}
                </td>

                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={values[row.stockId] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [row.stockId]: e.target.value,
                      }))
                    }
                    placeholder="Inserisci barcode"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-black"
                  />
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => saveBarcode(row.stockId)}
                    disabled={loadingId === row.stockId}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                  >
                    {loadingId === row.stockId ? "Salvataggio..." : "Salva"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
