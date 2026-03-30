import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      code,
      barcode,
      name,
      brand,
      category,
      sizeGroup,
      purchasePrice,
      salePrice,
      colors,
      sizes,
      initialQuantities,
    } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Codice e nome sono obbligatori." },
        { status: 400 }
      );
    }

    if (!Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json(
        { error: "Inserisci almeno un colore." },
        { status: 400 }
      );
    }

    if (!Array.isArray(sizes) || sizes.length === 0) {
      return NextResponse.json(
        { error: "Inserisci almeno una taglia." },
        { status: 400 }
      );
    }

    const existingArticle = await prisma.article.findUnique({
      where: { code },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: "Esiste già un articolo con questo codice." },
        { status: 400 }
      );
    }

    if (barcode) {
      const existingBarcode = await prisma.article.findUnique({
        where: { barcode },
      });

      if (existingBarcode) {
        return NextResponse.json(
          { error: "Esiste già un articolo con questo barcode." },
          { status: 400 }
        );
      }
    }

    const article = await prisma.article.create({
      data: {
        code,
        barcode: barcode || null,
        name,
        brand,
        category,
        sizeGroup,
      },
    });

    for (const colorName of colors) {
      const color = await prisma.color.upsert({
        where: { name: colorName },
        update: {},
        create: { name: colorName },
      });

      const variant = await prisma.variant.create({
        data: {
          articleId: article.id,
          colorId: color.id,
        },
      });

      for (let index = 0; index < sizes.length; index++) {
        const sizeName = sizes[index];

        const size = await prisma.size.upsert({
          where: { name: sizeName },
          update: {},
          create: {
            name: sizeName,
            sortOrder: 1000 + index,
          },
        });

        const quantity =
          initialQuantities?.[colorName]?.[sizeName] !== undefined
            ? Number(initialQuantities[colorName][sizeName])
            : 0;

        await prisma.stock.create({
          data: {
            variantId: variant.id,
            sizeId: size.id,
            quantity,
            minQuantity: 0,
          },
        });

        if (quantity > 0) {
          await prisma.movement.create({
            data: {
              variantId: variant.id,
              sizeId: size.id,
              quantity,
              type: "LOAD",
              note: "Carico iniziale creazione articolo",
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}