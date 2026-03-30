export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getVariantById, getVariantMovements } from "@/lib/inventory";

import InventoryForm from "@/components/stock/InventoryForm";
import LoadStockForm from "@/components/stock/LoadStockForm";
import UnloadStockForm from "@/components/stock/UnloadStockForm";
import StockBarcodeManager from "@/components/stock/StockBarcodeManager";

type StockItem = {
  stockId: number;
  sizeId: number;
  size: string;
  quantity: number;
  minQuantity: number;
  barcode: string;
};

type MovementItem = {
  id: number;
  type: string;
  quantity: number;
  size: string;
  createdAt: Date | string;
  note?: string | null;
};

type VariantData = {
  id: number;
  code: string;
  article: string;
  color: string;
  brand?: string | null;
  category?: string | null;
  season?: string | null;
  stocks: StockItem[];
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VariantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!numericId || Number.isNaN(numericId)) {
    notFound();
  }

  const variant = (await getVariantById(numericId)) as VariantData | null;
  const movements = (await getVariantMovements(numericId)) as MovementItem[];

  if (!variant) {
    notFound();
  }

  const total: number = variant.stocks.reduce(
    (sum: number, item: StockItem) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{variant.brand ?? "-"}</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {variant.article}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Codice: {variant.code} • Colore: {variant.color}
          </p>

          <div className="mt-4 text-lg font-semibold text-gray-900">
            Totale stock: {total}
          </div>
        </div>

        <InventoryForm
          variantId={variant.id}
          sizes={variant.stocks.map((s: StockItem) => ({
            sizeId: s.sizeId,
            size: s.size,
            quantity: s.quantity,
          }))}
        />

        <LoadStockForm
          variantId={variant.id}
          sizes={variant.stocks.map((s: StockItem) => ({
            sizeId: s.sizeId,
            size: s.size,
          }))}
        />

        <UnloadStockForm
          variantId={variant.id}
          sizes={variant.stocks.map((s: StockItem) => ({
            sizeId: s.sizeId,
            size: s.size,
          }))}
        />

        <StockBarcodeManager rows={variant.stocks} />

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Movimenti recenti
          </h2>

          {movements.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nessun movimento registrato.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {movements.map((m: MovementItem) => (
                <div
                  key={m.id}
                  className="flex justify-between gap-4 border-b border-gray-100 pb-2"
                >
                  <span>
                    {m.type} • {m.size}
                  </span>
                  <span className="font-semibold">
                    {m.quantity > 0 ? "+" : ""}
                    {m.quantity}
                  </span>
                  <span className="text-gray-500">
                    {new Date(m.createdAt).toLocaleString("it-IT")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
