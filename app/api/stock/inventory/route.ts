import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId, sizeId, countedQuantity } = body;

    if (
      !variantId ||
      !sizeId ||
      countedQuantity === undefined ||
      countedQuantity < 0
    ) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const parsedVariantId = Number(variantId);
    const parsedSizeId = Number(sizeId);
    const parsedCountedQuantity = Number(countedQuantity);

    const stock = await prisma.stock.findUnique({
      where: {
        variantId_sizeId: {
          variantId: parsedVariantId,
          sizeId: parsedSizeId,
        },
      },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock non trovato" }, { status: 404 });
    }

    const difference = parsedCountedQuantity - stock.quantity;

    await prisma.stock.update({
      where: {
        variantId_sizeId: {
          variantId: parsedVariantId,
          sizeId: parsedSizeId,
        },
      },
      data: {
        quantity: parsedCountedQuantity,
      },
    });

    await prisma.movement.create({
      data: {
        variantId: parsedVariantId,
        sizeId: parsedSizeId,
        quantity: difference,
        type: "ADJUSTMENT",
        note: `Inventario: sistema ${stock.quantity}, contati ${parsedCountedQuantity}`,
      },
    });

    return NextResponse.json({
      success: true,
      previousQuantity: stock.quantity,
      countedQuantity: parsedCountedQuantity,
      difference,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}