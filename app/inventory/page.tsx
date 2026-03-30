export const dynamic = "force-dynamic";

import { getInventoryRows } from "@/lib/inventory";
import InventoryClient from "@/components/inventory/InventoryClient";

export default async function InventoryPage() {
  const clothing = await getInventoryRows("CLOTHING");
  const pants = await getInventoryRows("PANTS");
  const shoes = await getInventoryRows("SHOES");

  return (
    <InventoryClient
      clothing={clothing}
      pants={pants}
      shoes={shoes}
    />
  );
}
