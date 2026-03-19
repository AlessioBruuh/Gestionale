import { getInventoryRows } from "@/lib/inventory";
import Link from "next/link";

function getCellClass(value: number) {
  if (value === 0) return "bg-red-100 text-red-700";
  if (value <= 2) return "bg-yellow-100 text-yellow-700";
  return "bg-white text-black";
}

export default async function InventoryPage() {
  const data = await getInventoryRows();

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Magazzino</h1>
        <p className="text-sm text-gray-600">
          Vista orizzontale taglie e colori
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Codice</th>
              <th className="p-3 text-left">Articolo</th>
              <th className="p-3 text-left">Colore</th>
              <th className="p-3 text-center">XS</th>
              <th className="p-3 text-center">S</th>
              <th className="p-3 text-center">M</th>
              <th className="p-3 text-center">L</th>
              <th className="p-3 text-center">XL</th>
              <th className="p-3 text-center">Totale</th>
            </tr>
          </thead>

          <tbody>
  {data.map((row) => (
    <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
      <td className="p-3 font-medium">
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.code}
        </Link>
      </td>
      <td className="p-3">
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.article}
        </Link>
      </td>
      <td className="p-3">
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.color}
        </Link>
      </td>

      <td className={`p-3 text-center font-semibold ${getCellClass(row.XS)}`}>
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.XS}
        </Link>
      </td>
      <td className={`p-3 text-center font-semibold ${getCellClass(row.S)}`}>
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.S}
        </Link>
      </td>
      <td className={`p-3 text-center font-semibold ${getCellClass(row.M)}`}>
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.M}
        </Link>
      </td>
      <td className={`p-3 text-center font-semibold ${getCellClass(row.L)}`}>
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.L}
        </Link>
      </td>
      <td className={`p-3 text-center font-semibold ${getCellClass(row.XL)}`}>
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.XL}
        </Link>
      </td>

      <td className="p-3 text-center font-bold">
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.total}
        </Link>
      </td>
      <td className="p-3 text-center">
        <Link href={`/inventory/${row.id}`} className="block w-full h-full">
          {row.status}
        </Link>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </main>
  );
}