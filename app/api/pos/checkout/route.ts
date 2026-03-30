import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CartItem = {
  stockId: number;
  variantId: number;
  sizeId: number;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body as { items: CartItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Carrello vuoto" },
        { status: 400 }
      );
    }

    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { id: Number(item.stockId) },
      });

      if (!stock) {
        return NextResponse.json(
          { error: "Riga stock non trovata" },
          { status: 404 }
        );
      }

      if (stock.quantity < item.quantity) {
        return NextResponse.json(
          { error: "Quantità insufficiente per uno o più articoli" },
          { status: 400 }
        );
      }
    }

    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { id: Number(item.stockId) },
      });

      if (!stock) continue;

      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          quantity: stock.quantity - item.quantity,
        },
      });

      await prisma.movement.create({
        data: {
          variantId: Number(item.variantId),
          sizeId: Number(item.sizeId),
          quantity: item.quantity,
          type: "UNLOAD",
          note: "Vendita POS",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore checkout POS" },
      { status: 500 }
    );
  }
}