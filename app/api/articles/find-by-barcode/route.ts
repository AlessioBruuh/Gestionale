import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get("barcode");

    if (!barcode || !barcode.trim()) {
      return NextResponse.json(
        { error: "Barcode mancante" },
        { status: 400 }
      );
    }

    const trimmedBarcode = barcode.trim();

    const stock = await prisma.stock.findUnique({
      where: {
        barcode: trimmedBarcode,
      },
      include: {
        variant: {
          include: {
            article: true,
            color: true,
          },
        },
        size: true,
      },
    });

    if (stock) {
      return NextResponse.json({
        found: true,
        variantId: stock.variantId,
        sizeId: stock.sizeId,
        article: stock.variant.article.name,
        code: stock.variant.article.code,
        color: stock.variant.color.name,
        size: stock.size.name,
        source: "stock",
      });
    }

    const article = await prisma.article.findUnique({
      where: {
        barcode: trimmedBarcode,
      },
      include: {
        variants: {
          orderBy: {
            id: "asc",
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (article && article.variants.length > 0) {
      return NextResponse.json({
        found: true,
        variantId: article.variants[0].id,
        article: article.name,
        code: article.code,
        source: "article",
      });
    }

    return NextResponse.json({
      found: false,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore interno" },
      { status: 500 }
    );
  }
}