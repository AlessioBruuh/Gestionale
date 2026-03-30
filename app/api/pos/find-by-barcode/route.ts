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

    const stock = await prisma.stock.findUnique({
      where: {
        barcode: barcode.trim(),
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

    if (!stock) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      stockId: stock.id,
      variantId: stock.variantId,
      sizeId: stock.sizeId,
      barcode: stock.barcode,
      code: stock.variant.article.code,
      article: stock.variant.article.name,
      color: stock.variant.color.name,
      size: stock.size.name,
      quantity: stock.quantity,
      salePrice: stock.variant.article.salePrice
        ? Number(stock.variant.article.salePrice)
        : 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore ricerca barcode POS" },
      { status: 500 }
    );
  }
}