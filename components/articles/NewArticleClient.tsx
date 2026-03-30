"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type SizeGroup = "CLOTHING" | "PANTS" | "SHOES";

const sizeGroupConfig: Record<
  SizeGroup,
  { title: string; subtitle: string; example: string }
> = {
  CLOTHING: {
    title: "Abbigliamento",
    subtitle: "Felpe, t-shirt, giacche",
    example: "XS, S, M, L, XL",
  },
  PANTS: {
    title: "Pantaloni",
    subtitle: "Jeans, cargo, pantaloni",
    example: "44, 46, 48, 50",
  },
  SHOES: {
    title: "Scarpe",
    subtitle: "Sneakers, stivali, running",
    example: "36, 37, 38, 39, 40",
  },
};

type QuantityMap = Record<string, number>;

function makeKey(color: string, size: string) {
  return `${color}__${size}`;
}

export default function NewArticleClient() {
  const searchParams = useSearchParams();
  const barcodeFromUrl = searchParams.get("barcode") ?? "";

  const [code, setCode] = useState("");
  const [barcode, setBarcode] = useState(barcodeFromUrl);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [sizeGroup, setSizeGroup] = useState<SizeGroup>("CLOTHING");
  const [colors, setColors] = useState("");
  const [sizes, setSizes] = useState("");
  const [quantities, setQuantities] = useState<QuantityMap>({});
  const [loading, setLoading] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const selectedGroup = useMemo(() => sizeGroupConfig[sizeGroup], [sizeGroup]);

  const colorList = useMemo(() => {
    return Array.from(
      new Set(
        colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      )
    );
  }, [colors]);

  const sizeList = useMemo(() => {
    return Array.from(
      new Set(
        sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
  }, [sizes]);

  const totalInitialPieces = useMemo(() => {
    return Object.values(quantities).reduce((sum, value) => sum + (value || 0), 0);
  }, [quantities]);

  function updateQuantity(color: string, size: string, value: string) {
    const parsed = Number(value);
    const key = makeKey(color, size);

    setQuantities((prev) => ({
      ...prev,
      [key]: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!code || !name) {
      alert("Inserisci almeno codice e nome articolo.");
      return;
    }

    if (colorList.length === 0) {
      alert("Inserisci almeno un colore.");
      return;
    }

    if (sizeList.length === 0) {
      alert("Inserisci almeno una taglia.");
      return;
    }

    const initialQuantities: Record<string, Record<string, number>> = {};

    for (const color of colorList) {
      initialQuantities[color] = {};

      for (const size of sizeList) {
        const key = makeKey(color, size);
        initialQuantities[color][size] = quantities[key] ?? 0;
      }
    }

    try {
      setLoading(true);

      const res = await fetch("/api/articles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          barcode,
          name,
          brand,
          category,
          sizeGroup,
          colors: colorList,
          sizes: sizeList,
          purchasePrice,
          salePrice,
          initialQuantities,
          
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Errore creazione articolo");
        return;
      }

      alert("Articolo creato con successo");

      setCode("");
      setBarcode("");
      setName("");
      setBrand("");
      setCategory("");
      setPurchasePrice("");
      setSalePrice("");
      setSizeGroup("CLOTHING");
      setColors("");
      setSizes("");
      setQuantities({});
    } catch (error) {
      console.error(error);
      alert("Errore creazione articolo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/inventory"
              className="mb-3 inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              ← Torna al magazzino
            </Link>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Nuovo articolo
            </h1>
            <p className="mt-2 text-gray-500">
              Crea il prodotto e inserisci subito le quantità iniziali per colore e taglia.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">Dati principali</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Le informazioni base del prodotto.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Codice a barre">
                  <input
                    autoFocus
                    className="w-full rounded-2xl border-2 border-black bg-white px-4 py-4 text-gray-900 outline-none transition focus:border-black"
                    placeholder="Scansiona o inserisci barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </Field>

                <Field label="Codice articolo interno">
                  <input
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
                    placeholder="Es. J001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </Field>

                <Field label="Nome articolo">
                  <input
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
                    placeholder="Es. Jeans Urban"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <Field label="Brand">
                  <input
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
                    placeholder="Es. UrbanLab"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Categoria">
                    <input
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
                      placeholder="Es. Jeans"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </Field>
                  <Field label="Prezzo acquisto">
  <input
    type="number"
    step="0.01"
    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
    placeholder="Es. 39.90"
    value={purchasePrice}
    onChange={(e) => setPurchasePrice(e.target.value)}
  />
</Field>

<Field label="Prezzo vendita">
  <input
    type="number"
    step="0.01"
    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
    placeholder="Es. 79.90"
    value={salePrice}
    onChange={(e) => setSalePrice(e.target.value)}
  />
</Field>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">Sezione magazzino</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Scegli dove deve comparire l’articolo.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {(Object.keys(sizeGroupConfig) as SizeGroup[]).map((key) => {
                  const item = sizeGroupConfig[key];
                  const active = key === sizeGroup;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSizeGroup(key)}
                      className={[
                        "rounded-3xl border p-4 text-left transition",
                        active
                          ? "border-black bg-black text-white shadow-lg shadow-black/10"
                          : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="text-base font-bold">{item.title}</div>
                      <div
                        className={[
                          "mt-1 text-sm",
                          active ? "text-white/80" : "text-gray-500",
                        ].join(" ")}
                      >
                        {item.subtitle}
                      </div>
                      <div
                        className={[
                          "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          active
                            ? "bg-white/15 text-white"
                            : "bg-gray-100 text-gray-700",
                        ].join(" ")}
                      >
                        {item.example}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">Varianti</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Inserisci colori e taglie separati da virgola.
                </p>
              </div>

              <div className="space-y-4">
                <Field label="Colori">
                  <input
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
                    placeholder="Es. Nero, Blu, Rosso"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                  />
                </Field>

                <Field label="Taglie">
                  <input
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:bg-white"
                    placeholder={`Es. ${selectedGroup.example}`}
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                  />
                </Field>
              </div>
            </section>

            {colorList.length > 0 && sizeList.length > 0 && (
              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Quantità iniziali</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Inserisci i pezzi iniziali per ogni colore e taglia.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Colore
                        </th>

                        {sizeList.map((size) => (
                          <th
                            key={size}
                            className="px-4 py-3 text-center font-semibold text-gray-600"
                          >
                            {size}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {colorList.map((color) => (
                        <tr key={color} className="border-t border-gray-100">
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {color}
                          </td>

                          {sizeList.map((size) => {
                            const key = makeKey(color, size);

                            return (
                              <td key={key} className="px-3 py-3">
                                <input
                                  type="number"
                                  min={0}
                                  value={quantities[key] ?? 0}
                                  onChange={(e) =>
                                    updateQuantity(color, size, e.target.value)
                                  }
                                  className="w-20 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center outline-none transition focus:border-black focus:bg-white"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Anteprima</p>
                <h2 className="text-xl font-bold text-gray-900">
                  {name || "Nome articolo"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {code || "Codice articolo"}
                </p>
              </div>

              <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                <InfoRow label="Barcode" value={barcode || "-"} />
                <InfoRow label="Brand" value={brand || "-"} />
                <InfoRow label="Categoria" value={category || "-"} />
                <InfoRow label="Sezione" value={selectedGroup.title} />
                <InfoRow label="Colori" value={colorList.join(", ") || "-"} />
                <InfoRow label="Taglie" value={sizeList.join(", ") || "-"} />
                <InfoRow
                  label="Pezzi iniziali"
                  value={String(totalInitialPieces)}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  Sezione selezionata
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  L’articolo apparirà in questa tabella del magazzino.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5">
                <div className="text-lg font-bold text-gray-900">
                  {selectedGroup.title}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {selectedGroup.subtitle}
                </div>
                <div className="mt-4 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  Taglie esempio: {selectedGroup.example}
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-black px-5 py-4 text-base font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creazione in corso..." : "Crea articolo"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}