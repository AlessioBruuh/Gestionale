import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId, sizeId, quantity } = body;

    if (!variantId || !sizeId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const stock = await prisma.stock.findUnique({
      where: {
        variantId_sizeId: {
          variantId: Number(variantId),
          sizeId: Number(sizeId),
        },
      },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock non trovato" }, { status: 404 });
    }

    if (stock.quantity < quantity) {
      return NextResponse.json(
        { error: "Quantità insufficiente" },
        { status: 400 }
      );
    }

    const newQuantity = stock.quantity - quantity;

    await prisma.stock.update({
      where: {
        variantId_sizeId: {
          variantId: Number(variantId),
          sizeId: Number(sizeId),
        },
      },
      data: {
        quantity: newQuantity,
      },
    });

    await prisma.movement.create({
      data: {
        variantId: Number(variantId),
        sizeId: Number(sizeId),
        quantity: Number(quantity),
        type: "UNLOAD",
        note: "Scarico merce",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}