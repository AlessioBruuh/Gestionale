import { prisma } from "@/lib/prisma";


export async function getInventoryRows(sizeGroup: "CLOTHING" | "PANTS" | "SHOES") {
  const variants = await prisma.variant.findMany({
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
  });

  return variants.map((variant) => {
    const sizeMap: Record<string, number> = {};

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
  const variant = await prisma.variant.findUnique({
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
  });

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
      sizeId: stock.sizeId,
      size: stock.size.name,
      quantity: stock.quantity,
      minQuantity: stock.minQuantity,
    })),
  };
}
export async function getVariantMovements(variantId: number) {
  const movements = await prisma.movement.findMany({
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
  });

  return movements.map((movement) => ({
    id: movement.id,
    type: movement.type,
    quantity: movement.quantity,
    note: movement.note,
    createdAt: movement.createdAt,
    size: movement.size.name,
  }));
}