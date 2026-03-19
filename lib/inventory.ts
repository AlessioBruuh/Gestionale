import { prisma } from "@/lib/prisma";

type SizeNameMap = Record<string, number>;

type VariantWithRelations = {
  id: number;
  article: {
    code: string;
    name: string;
    brand: string | null;
    category: string | null;
    season: string | null;
    sizeGroup?: "CLOTHING" | "PANTS" | "SHOES" | null;
  };
  color: {
    name: string;
  };
  stocks: Array<{
    id: number;
    sizeId: number;
    quantity: number;
    minQuantity: number;
    barcode: string | null;
    size: {
      name: string;
      sortOrder: number;
    };
  }>;
};

type MovementWithSize = {
  id: number;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: Date;
  size: {
    name: string;
  };
};

export async function getInventoryRows(
  sizeGroup: "CLOTHING" | "PANTS" | "SHOES"
) {
  const variants = (await prisma.variant.findMany({
    where: {
      article: {
        sizeGroup,
      },
    },
    include: {
      article: true,
      color: true,
      stocks: {
        include: {
          size: true,
        },
      },
    },
    orderBy: [
      { article: { code: "asc" } },
      { color: { name: "asc" } },
    ],
  })) as VariantWithRelations[];

  return variants.map((variant: VariantWithRelations) => {
    const sizeMap: SizeNameMap = {};

    for (const stock of variant.stocks) {
      sizeMap[stock.size.name] = stock.quantity;
    }

    return {
      id: variant.id,
      code: variant.article.code,
      article: variant.article.name,
      color: variant.color.name,
      sizes: sizeMap,
    };
  });
}

export async function getVariantById(id: number) {
  const variant = (await prisma.variant.findUnique({
    where: { id },
    include: {
      article: true,
      color: true,
      stocks: {
        include: {
          size: true,
        },
        orderBy: {
          size: {
            sortOrder: "asc",
          },
        },
      },
    },
  })) as VariantWithRelations | null;

  if (!variant) return null;

  return {
    id: variant.id,
    code: variant.article.code,
    article: variant.article.name,
    color: variant.color.name,
    brand: variant.article.brand,
    category: variant.article.category,
    season: variant.article.season,
    stocks: variant.stocks.map((stock) => ({
      stockId: stock.id,
      sizeId: stock.sizeId,
      size: stock.size.name,
      quantity: stock.quantity,
      minQuantity: stock.minQuantity,
      barcode: stock.barcode ?? "",
    })),
  };
}

export async function getVariantMovements(variantId: number) {
  const movements = (await prisma.movement.findMany({
    where: {
      variantId,
    },
    include: {
      size: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })) as MovementWithSize[];

  return movements.map((movement: MovementWithSize) => ({
    id: movement.id,
    type: movement.type,
    quantity: movement.quantity,
    note: movement.note,
    createdAt: movement.createdAt,
    size: movement.size.name,
  }));
}
