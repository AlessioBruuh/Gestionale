import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL non trovata nel file .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const sizes = [
    { name: "XS", sortOrder: 1 },
    { name: "S", sortOrder: 2 },
    { name: "M", sortOrder: 3 },
    { name: "L", sortOrder: 4 },
    { name: "XL", sortOrder: 5 },
  ];

  for (const size of sizes) {
    await prisma.size.upsert({
      where: { name: size.name },
      update: { sortOrder: size.sortOrder },
      create: size,
    });
  }

  const red = await prisma.color.upsert({
    where: { name: "Rosso" },
    update: {},
    create: {
      name: "Rosso",
      hexCode: "#ff0000",
    },
  });

  const blue = await prisma.color.upsert({
    where: { name: "Blu" },
    update: {},
    create: {
      name: "Blu",
      hexCode: "#0000ff",
    },
  });

  const black = await prisma.color.upsert({
    where: { name: "Nero" },
    update: {},
    create: {
      name: "Nero",
      hexCode: "#000000",
    },
  });

 const article1 = await prisma.article.upsert({
  where: { code: "A1928" },
  update: {
    sizeGroup: "CLOTHING",
  },
  create: {
    code: "A1928",
    name: "Icon Hoodie",
    brand: "Brand Icon",
    category: "Felpa",
    season: "PE26",
    sizeGroup: "CLOTHING",
  },
});

  const article2 = await prisma.article.upsert({
  where: { code: "B5531" },
  update: {
    sizeGroup: "CLOTHING",
  },
  create: {
    code: "B5531",
    name: "T-Shirt Basic",
    brand: "UrbanLab",
    category: "T-Shirt",
    season: "PE26",
    sizeGroup: "CLOTHING",
  },
});

  const variantRed = await prisma.variant.upsert({
    where: {
      articleId_colorId: {
        articleId: article1.id,
        colorId: red.id,
      },
    },
    update: {},
    create: {
      articleId: article1.id,
      colorId: red.id,
    },
  });

  const variantBlue = await prisma.variant.upsert({
    where: {
      articleId_colorId: {
        articleId: article1.id,
        colorId: blue.id,
      },
    },
    update: {},
    create: {
      articleId: article1.id,
      colorId: blue.id,
    },
  });

  const variantBlack = await prisma.variant.upsert({
    where: {
      articleId_colorId: {
        articleId: article2.id,
        colorId: black.id,
      },
    },
    update: {},
    create: {
      articleId: article2.id,
      colorId: black.id,
    },
  });

  const allSizes = await prisma.size.findMany();

  const stockData = [
    { variantId: variantRed.id, values: { XS: 1, S: 19, M: 18, L: 0, XL: 0 } },
    { variantId: variantBlue.id, values: { XS: 0, S: 4, M: 7, L: 2, XL: 0 } },
    { variantId: variantBlack.id, values: { XS: 2, S: 5, M: 6, L: 3, XL: 1 } },
  ];

  for (const item of stockData) {
    for (const size of allSizes) {
      const quantity = item.values[size.name as keyof typeof item.values] ?? 0;

      await prisma.stock.upsert({
        where: {
          variantId_sizeId: {
            variantId: item.variantId,
            sizeId: size.id,
          },
        },
        update: {
          quantity,
        },
        create: {
          variantId: item.variantId,
          sizeId: size.id,
          quantity,
          minQuantity: 0,
        },
      });
    }
  }

  console.log("Seed completato con articoli, colori, varianti e stock.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });