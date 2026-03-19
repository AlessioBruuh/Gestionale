import { notFound } from "next/navigation";
import { getVariantById, getVariantMovements } from "@/lib/inventory";

import InventoryForm from "@/components/inventory/InventoryForm";
import LoadStockForm from "@/components/inventory/LoadStockForm";
import UnloadStockForm from "@/components/inventory/UnloadStockForm";
import StockBarcodeManager from "@/components/stock/StockBarcodeManager";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function VariantDetailPage({ params }: PageProps) {
  const numericId = Number(params.id);

  if (!numericId || Number.isNaN(numericId)) {
    notFound();
  }

  const variant = await getVariantById(numericId);
  const movements = await getVariantMovements(numericId);

  if (!variant) {
    notFound();
  }

  const total: number = variant.stocks.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{variant.article.brand}</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {variant.article.name}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Codice: {variant.article.code} • Colore: {variant.color.name}
          </p>

          <div className="mt-4 text-lg font-semibold text-gray-900">
            Totale stock: {total}
          </div>
        </div>

        {/* INVENTARIO */}
        <InventoryForm
          variantId={variant.id}
          sizes={variant.stocks.map(
            (s: { sizeId: number; size: string; quantity: number }) => ({
              sizeId: s.sizeId,
              size: s.size,
              quantity: s.quantity,
            })
          )}
        />

        {/* CARICO */}
        <LoadStockForm
          variantId={variant.id}
          sizes={variant.stocks.map(
            (s: { sizeId: number; size: string }) => ({
              sizeId: s.sizeId,
              size: s.size,
            })
          )}
        />

        {/* SCARICO */}
        <UnloadStockForm
          variantId={variant.id}
          sizes={variant.stocks.map(
            (s: { sizeId: number; size: string }) => ({
              sizeId: s.sizeId,
              size: s.size,
            })
          )}
        />

        {/* BARCODE */}
        <StockBarcodeManager rows={variant.stocks} />

        {/* MOVIMENTI */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Movimenti recenti
          </h2>

          {movements.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nessun movimento registrato.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {movements.map(
                (m: {
                  id: number;
                  type: string;
                  quantity: number;
                  size: string;
                  createdAt: Date;
                }) => (
                  <div
                    key={m.id}
                    className="flex justify-between border-b border-gray-100 pb-2"
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
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}