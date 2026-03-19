import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getInventoryRows } from "@/lib/inventory";

type GroupKey = "CLOTHING" | "PANTS" | "SHOES";

const GROUPS: Record<GroupKey, { title: string; sizes: string[] }> = {
  CLOTHING: {
    title: "Abbigliamento",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  PANTS: {
    title: "Pantaloni",
    sizes: ["44", "46", "48", "50"],
  },
  SHOES: {
    title: "Scarpe",
    sizes: ["36", "37", "38", "39", "40"],
  },
};

type InventoryRow = {
  id: number;
  code: string;
  article: string;
  color: string;
  sizes: Record<string, number>;
};

function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  size = 10,
  color = rgb(0, 0, 0)
) {
  page.drawText(text, {
    x,
    y,
    size,
    color,
  });
}

function drawSection(
  page: any,
  title: string,
  rows: InventoryRow[],
  sizes: string[],
  startY: number
) {
  let y = startY;

  drawText(page, title, 40, y, 14, rgb(0.1, 0.1, 0.1));
  y -= 24;

  const columns = [
    { key: "code", label: "Codice", width: 60 },
    { key: "article", label: "Articolo", width: 150 },
    { key: "color", label: "Colore", width: 70 },
    ...sizes.map((size) => ({
      key: size,
      label: size,
      width: 40,
    })),
    { key: "total", label: "Tot", width: 40 },
  ];

  let x = 40;

  for (const col of columns) {
    drawText(page, col.label, x, y, 9, rgb(0.35, 0.35, 0.35));
    x += col.width;
  }

  y -= 18;

  if (rows.length === 0) {
    drawText(page, "Nessun articolo presente.", 40, y, 10, rgb(0.45, 0.45, 0.45));
    return y - 24;
  }

  for (const row of rows) {
    x = 40;

    const total = sizes.reduce((sum, size) => sum + (row.sizes[size] ?? 0), 0);

    const values: Record<string, string> = {
      code: row.code,
      article: row.article,
      color: row.color,
      total: String(total),
    };

    for (const size of sizes) {
      values[size] = String(row.sizes[size] ?? 0);
    }

    for (const col of columns) {
      drawText(page, values[col.key] ?? "", x, y, 9, rgb(0.1, 0.1, 0.1));
      x += col.width;
    }

    y -= 16;
  }

  return y - 18;
}

export async function GET() {
  try {
    const clothing = await getInventoryRows("CLOTHING");
    const pants = await getInventoryRows("PANTS");
    const shoes = await getInventoryRows("SHOES");

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle("Report Magazzino");

    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.setFont(font);

    page.drawText("Report Magazzino", {
      x: 40,
      y: height - 40,
      size: 22,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText(`Generato il ${new Date().toLocaleString("it-IT")}`, {
      x: 40,
      y: height - 62,
      size: 10,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });

    let currentY = height - 95;

    currentY = drawSection(
      page,
      GROUPS.CLOTHING.title,
      clothing,
      GROUPS.CLOTHING.sizes,
      currentY
    );

    currentY = drawSection(
      page,
      GROUPS.PANTS.title,
      pants,
      GROUPS.PANTS.sizes,
      currentY
    );

    currentY = drawSection(
      page,
      GROUPS.SHOES.title,
      shoes,
      GROUPS.SHOES.sizes,
      currentY
    );

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="report-magazzino.pdf"',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore generazione report PDF" },
      { status: 500 }
    );
  }
}