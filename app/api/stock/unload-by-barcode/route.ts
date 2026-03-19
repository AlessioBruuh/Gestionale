import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { barcode } = body;

    if (!barcode || typeof barcode !== "string") {
      return NextResponse.json(
        { error: "Barcode non valido" },
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
      return NextResponse.json(
        { error: "Barcode non trovato" },
        { status: 404 }
      );
    }

    if (stock.quantity <= 0) {
      return NextResponse.json(
        {
          error: "Stock esaurito",
          article: stock.variant.article.name,
          color: stock.variant.color.name,
          size: stock.size.name,
        },
        { status: 400 }
      );
    }

    const newQuantity = stock.quantity - 1;

    await prisma.stock.update({
      where: {
        id: stock.id,
      },
      data: {
        quantity: newQuantity,
      },
    });

    await prisma.movement.create({
      data: {
        variantId: stock.variantId,
        sizeId: stock.sizeId,
        quantity: 1,
        type: "UNLOAD",
        note: `Scarico automatico da barcode ${barcode.trim()}`,
      },
    });

    return NextResponse.json({
      success: true,
      article: stock.variant.article.name,
      code: stock.variant.article.code,
      color: stock.variant.color.name,
      size: stock.size.name,
      previousQuantity: stock.quantity,
      newQuantity,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore interno" },
      { status: 500 }
    );
  }
}