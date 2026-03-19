import Link from "next/link";
import UnloadStockForm from "@/components/stock/UnloadStockForm";
import LoadStockForm from "@/components/stock/LoadStockForm";
import { notFound } from "next/navigation";
import { getVariantById, getVariantMovements } from "@/lib/inventory";
import InventoryForm from "@/components/stock/InventoryForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getCellClass(value: number) {
  if (value === 0) return "bg-red-100 text-red-700";
  if (value <= 2) return "bg-yellow-100 text-yellow-700";
  return "bg-white text-black";
}

export default async function VariantDetailPage({ params }: PageProps) {
  const { id } = await params;

  const variant = await getVariantById(Number(id));
  const movements = await getVariantMovements(Number(id));

  if (!variant) {
    notFound();
  }

 const total = variant.stocks.reduce(
  (sum: number, item: { quantity: number }) => sum + item.quantity,
  0
);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/inventory"
          className="inline-block text-sm text-blue-600 hover:underline mb-3"
        >
          ← Torna al magazzino
        </Link>

        <p className="text-sm text-gray-500 mb-1">Dettaglio articolo</p>

        <h1 className="text-3xl font-bold">
          {variant.code} - {variant.article}
        </h1>

        <p className="text-gray-600 mt-1">{variant.color}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Brand</p>
          <p className="font-semibold">{variant.brand ?? "-"}</p>
        </div>

        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Categoria</p>
          <p className="font-semibold">{variant.category ?? "-"}</p>
        </div>

        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Stagione</p>
          <p className="font-semibold">{variant.season ?? "-"}</p>
        </div>

        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Totale pezzi</p>
          <p className="font-semibold text-lg">{total}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Azioni magazzino</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          
<div className="mt-6">
  <InventoryForm
    variantId={variant.id}
    sizes={variant.stocks.map((s) => ({
      sizeId: s.sizeId,
      size: s.size,
      quantity: s.quantity,
    }))}
  />
</div>
        </div>
      </div>
<div className="mt-6">
  <LoadStockForm
    variantId={variant.id}
    sizes={variant.stocks.map((s) => ({
      sizeId: s.sizeId,
      size: s.size,
    }))}
  />
  <div className="mt-6">
  <UnloadStockForm
    variantId={variant.id}
    sizes={variant.stocks.map((s) => ({
      sizeId: s.sizeId,
      size: s.size,
    }))}
  />
</div>
</div>
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">
          Disponibilità per taglia
        </h2>
<div className="rounded-2xl border bg-white shadow-sm p-6 mt-8">
  <h2 className="text-lg font-semibold mb-4">Storico movimenti</h2>

  {movements.length === 0 ? (
    <p className="text-sm text-gray-500">Nessun movimento registrato.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Data</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-left">Taglia</th>
            <th className="p-3 text-center">Quantità</th>
            <th className="p-3 text-left">Nota</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id} className="border-t border-gray-100">
              <td className="p-3">
                {new Date(movement.createdAt).toLocaleString("it-IT")}
              </td>
              <td className="p-3">{movement.type}</td>
              <td className="p-3">{movement.size}</td>
              <td className="p-3 text-center font-semibold">
                {movement.quantity}
              </td>
              <td className="p-3">{movement.note ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {variant.stocks.map((item) => (
            <div
              key={item.sizeId}
              className={`rounded-2xl border p-5 text-center font-semibold ${getCellClass(
                item.quantity
              )}`}
            >
              <p className="text-sm mb-2">{item.size}</p>

              <p className="text-3xl">{item.quantity}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}