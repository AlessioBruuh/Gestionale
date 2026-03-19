"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type InventoryRow = {
  id: number;
  code: string;
  article: string;
  color: string;
  sizes: Record<string, number>;
};

type Props = {
  clothing: InventoryRow[];
  pants: InventoryRow[];
  shoes: InventoryRow[];
};

type TabKey = "CLOTHING" | "PANTS" | "SHOES";

const TAB_CONFIG: Record<TabKey, { label: string; sizes: string[] }> = {
  CLOTHING: {
    label: "Abbigliamento",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  PANTS: {
    label: "Pantaloni",
    sizes: ["44", "46", "48", "50"],
  },
  SHOES: {
    label: "Scarpe",
    sizes: ["36", "37", "38", "39", "40"],
  },
};

function getCellClass(value: number) {
  if (value === 0) return "bg-red-50 text-red-700";
  if (value <= 2) return "bg-yellow-50 text-yellow-700";
  return "bg-white text-gray-900";
}

function getTotal(row: InventoryRow, sizes: string[]) {
  return sizes.reduce((sum, size) => sum + (row.sizes[size] ?? 0), 0);
}

function getStatus(row: InventoryRow, sizes: string[]) {
  const values = sizes.map((size) => row.sizes[size] ?? 0);
  const zeroCount = values.filter((v) => v === 0).length;

  if (zeroCount >= 2) {
    return {
      label: "Riassortire",
      className: "bg-red-100 text-red-700",
    };
  }

  if (values.some((v) => v <= 2)) {
    return {
      label: "Attenzione",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "OK",
    className: "bg-green-100 text-green-700",
  };
}

export default function InventoryClient({
  clothing,
  pants,
  shoes,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("CLOTHING");
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");

  const currentRows = useMemo(() => {
    switch (activeTab) {
      case "CLOTHING":
        return clothing;
      case "PANTS":
        return pants;
      case "SHOES":
        return shoes;
      default:
        return [];
    }
  }, [activeTab, clothing, pants, shoes]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return currentRows;

    return currentRows.filter((row) => {
      return (
        String(row.code ?? "").toLowerCase().includes(term) ||
        String(row.article ?? "").toLowerCase().includes(term) ||
        String(row.color ?? "").toLowerCase().includes(term)
      );
    });
  }, [currentRows, search]);

  const sizes = TAB_CONFIG[activeTab].sizes;

  async function handleBarcodeSearch() {
    const value = barcode.trim();

    if (!value) return;

    try {
      setBarcodeLoading(true);
      setScannerMessage("");

      const res = await fetch(
        `/api/articles/find-by-barcode?barcode=${encodeURIComponent(value)}`
      );

      const data = await res.json();

      if (!res.ok) {
        setScannerMessage(data.error ?? "Errore ricerca barcode");
        return;
      }

      if (data.found && data.variantId) {
        window.location.href = `/inventory/${data.variantId}`;
        return;
      }

      setScannerMessage("Barcode non trovato");
    } catch (error) {
      console.error(error);
      setScannerMessage("Errore ricerca barcode");
    } finally {
      setBarcodeLoading(false);
    }
  }

  async function handleBarcodeUnload() {
    const value = barcode.trim();

    if (!value) return;

    try {
      setBarcodeLoading(true);
      setScannerMessage("");

      const res = await fetch("/api/stock/unload-by-barcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barcode: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setScannerMessage(data.error ?? "Errore scarico barcode");
        return;
      }

      setScannerMessage(
        `Scaricato: ${data.article} - ${data.color} - ${data.size} (nuovo stock: ${data.newQuantity})`
      );
      setBarcode("");

      window.location.reload();
    } catch (error) {
      console.error(error);
      setScannerMessage("Errore scarico barcode");
    } finally {
      setBarcodeLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Gestionale magazzino</p>
            <h1 className="text-3xl font-bold text-gray-900">Magazzino</h1>
          </div>

<div className="flex items-center gap-3">
  <a
    href="/api/reports/inventory"
    target="_blank"
    rel="noreferrer"
    className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
  >
    Esporta PDF
  </a>

  <Link
    href="/articles/new"
    className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
  >
    + Nuovo articolo
  </Link>
</div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scansiona barcode"
              className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleBarcodeSearch();
                }
              }}
            />

            <button
              type="button"
              onClick={handleBarcodeSearch}
              disabled={barcodeLoading}
              className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              Apri prodotto
            </button>
          </div>

          {scannerMessage && (
            <div className="mb-4 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-800">
              {scannerMessage}
            </div>
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-4">
              {(Object.keys(TAB_CONFIG) as TabKey[]).map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "rounded-xl border px-6 py-3 text-sm font-semibold transition",
                      isActive
                        ? "border-black bg-black text-white shadow"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {TAB_CONFIG[tab].label}
                  </button>
                );
              })}
            </div>

            <div className="w-full md:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca codice, articolo o colore"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {TAB_CONFIG[activeTab].label}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredRows.length} articoli visualizzati
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Codice
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Articolo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Colore
                  </th>

                  {sizes.map((size) => (
                    <th
                      key={size}
                      className="px-4 py-3 text-center font-semibold text-gray-600"
                    >
                      {size}
                    </th>
                  ))}

                  <th className="px-4 py-3 text-center font-semibold text-gray-600">
                    Totale
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">
                    Stato
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={sizes.length + 5}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      Nessun articolo trovato.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const total = getTotal(row, sizes);
                    const status = getStatus(row, sizes);

                    return (
                      <tr
                        key={row.id}
                        className="border-t border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <Link
                            href={`/inventory/${row.id}`}
                            className="hover:underline"
                          >
                            {row.code}
                          </Link>
                        </td>

                        <td className="px-4 py-3 text-gray-800">
                          <Link
                            href={`/inventory/${row.id}`}
                            className="hover:underline"
                          >
                            {row.article}
                          </Link>
                        </td>

                        <td className="px-4 py-3 text-gray-800">
                          <Link
                            href={`/inventory/${row.id}`}
                            className="hover:underline"
                          >
                            {row.color}
                          </Link>
                        </td>

                        {sizes.map((size) => {
                          const value = row.sizes[size] ?? 0;

                          return (
                            <td key={size} className="px-4 py-3 text-center">
                              <span
                                className={[
                                  "inline-flex min-w-[42px] items-center justify-center rounded-lg px-2 py-1 font-semibold",
                                  getCellClass(value),
                                ].join(" ")}
                              >
                                {value}
                              </span>
                            </td>
                          );
                        })}

                        <td className="px-4 py-3 text-center font-bold text-gray-900">
                          {total}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                              status.className,
                            ].join(" ")}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}