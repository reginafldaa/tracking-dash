import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

// Fungsi ini menerima ID pendaftaran dan me-return object Sertifikat yang baru dibuat
export async function autoGenerateSertifikat(pendaftaranId: string) {
  try {
    // 1. Ambil data Pendaftaran beserta relasinya
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        user: true,
        jadwal: { include: { pelatihan: true } },
      },
    });

    if (!pendaftaran || pendaftaran.status !== "LULUS") {
      throw new Error("Pendaftaran tidak ditemukan atau belum LULUS.");
    }

    // --- LOGIKA GENERATE PDF (Sama persis seperti yang kita buat di POST route.ts) ---
    const userName = pendaftaran.user?.name || "Nama Tidak Diketahui";
    const pelatihanName = pendaftaran.jadwal?.pelatihan?.name || "Pelatihan";
    const tanggalTerbitObj = new Date();
    const tanggalTerbit = tanggalTerbitObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const templatePath = path.join(process.cwd(), "public", "template-sertifikat.png");
    const templateBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedPng(templateBytes);
    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const namaPeserta = userName.toUpperCase();
    const nameFontSize = 80;
    const descFontSize = 30;

    const centerY = height / 2;
    const yPosisiNama = centerY + 40;
    const yPosisiGaris = centerY - 15;
    const yPosisiDeskripsi1 = centerY - 55;
    const yPosisiDeskripsi2 = centerY - 85;

    const nameTextWidth = fontBold.widthOfTextAtSize(namaPeserta, nameFontSize);
    page.drawText(namaPeserta, {
      x: width / 2 - nameTextWidth / 2,
      y: yPosisiNama,
      size: nameFontSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    const panjangGaris = Math.max(nameTextWidth + 100, width * 0.6);
    page.drawLine({
      start: { x: width / 2 - panjangGaris / 2, y: yPosisiGaris },
      end: { x: width / 2 + panjangGaris / 2, y: yPosisiGaris },
      thickness: 1.5,
      color: rgb(0, 0, 0),
    });

    const descLine1 = `Telah menyelesaikan ${pelatihanName} yang`;
    const descLine2 = `diselenggarakan oleh Liceria & Co pada ${tanggalTerbit}`;

    const descWidth1 = fontRegular.widthOfTextAtSize(descLine1, descFontSize);
    page.drawText(descLine1, {
      x: width / 2 - descWidth1 / 2,
      y: yPosisiDeskripsi1,
      size: descFontSize,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    const descWidth2 = fontRegular.widthOfTextAtSize(descLine2, descFontSize);
    page.drawText(descLine2, {
      x: width / 2 - descWidth2 / 2,
      y: yPosisiDeskripsi2,
      size: descFontSize,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    // --- SIMPAN FILE ---
    const pdfBytes = await pdfDoc.save();
    const fileName = `Sertifikat-${userName.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
    const savePath = path.join(process.cwd(), "public", "sertifikats", fileName);

    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(savePath, pdfBytes);

    // --- SIMPAN KE DATABASE ---
    const certificateUrl = `/sertifikats/${fileName}`;

    const newSertifikat = await prisma.sertifikat.create({
      data: {
        pendaftaranId,
        certificateUrl,
        issuedAt: tanggalTerbitObj,
      },
    });

    return newSertifikat;
  } catch (error) {
    console.error("Gagal auto-generate sertifikat:", error);
    throw error; // Lempar error agar API Pendaftaran tahu ada yang salah
  }
}