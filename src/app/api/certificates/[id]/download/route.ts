import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;
    const role = (session.user as { role?: string }).role;

    const { id } = await params;
    const certificate = await db.certificate.findUnique({
      where: { id },
      include: { user: true, course: true },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
    }
    if (certificate.userId !== userId && role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 paysage
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const navy = rgb(0x1b / 255, 0x3a / 255, 0x5c / 255);
    const gold = rgb(0xd4 / 255, 0xa8 / 255, 0x43 / 255);
    const gray = rgb(0.35, 0.35, 0.4);

    // Cadre décoratif
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: gold, borderWidth: 3 });
    page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: navy, borderWidth: 1 });

    const centerText = (text: string, y: number, font = fontRegular, size = 14, color = navy) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
    };

    centerText("DEUTSCH-INSTITUT", height - 90, fontBold, 22, navy);
    centerText("Deutsch Für Alle", height - 112, fontItalic, 11, gray);

    centerText("CERTIFICAT DE RÉUSSITE", height - 175, fontBold, 28, gold);

    centerText("Ce certificat est décerné à", height - 230, fontRegular, 13, gray);
    centerText(certificate.user.name, height - 265, fontBold, 26, navy);

    centerText("pour avoir suivi avec succès le cours", height - 305, fontRegular, 13, gray);
    centerText(certificate.course.title, height - 335, fontBold, 18, navy);
    centerText(`Niveau ${certificate.course.level}`, height - 358, fontRegular, 12, gray);

    const dateStr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
      certificate.issuedAt
    );
    centerText(`Délivré le ${dateStr}`, 110, fontRegular, 11, gray);
    centerText(`N° de certificat : ${certificate.certificateNumber}`, 90, fontRegular, 10, gray);

    // Signature
    page.drawLine({ start: { x: width / 2 - 100, y: 150 }, end: { x: width / 2 + 100, y: 150 }, thickness: 1, color: gray });
    centerText("La Direction — Deutsch-Institut", 132, fontItalic, 11, navy);

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificat-${certificate.certificateNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
