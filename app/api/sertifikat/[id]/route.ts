import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

type RouteParams = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

// GET: Mengambil satu sertifikat beserta data User
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sertifikat = await prisma.sertifikat.findUnique({
      where: { id },
      include: { 
        pendaftaran: {
          include: { user: true } 
        } 
      },
    });

    if (!sertifikat) return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });
    return NextResponse.json(sertifikat, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// PATCH: Update Data & Kondisional Generate PDF
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { namaPeserta, status, issuedAt } = body;

    // 1. Ambil data lama
    const existingSertifikat = await prisma.sertifikat.findUnique({
      where: { id },
      include: {
        pendaftaran: {
          include: {
            user: true,
            jadwal: { include: { pelatihan: true } }
          }
        }
      }
    });

    if (!existingSertifikat) {
      return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });
    }

    // 2. Update Nama di tabel User
    if (namaPeserta && existingSertifikat.pendaftaran?.userId) {
      await prisma.user.update({
        where: { id: existingSertifikat.pendaftaran.userId },
        data: { name: namaPeserta }
      });
    }

    // 3. Update Status di tabel Pendaftaran
    if (status && existingSertifikat.pendaftaranId) {
      await prisma.pendaftaran.update({
        where: { id: existingSertifikat.pendaftaranId },
        data: { status }
      });
    }

    // --- 4. LOGIKA KONDISIONAL (CEK KELULUSAN) ---
    if (status !== "LULUS") {
      // Jika diubah jadi TIDAK LULUS, cabut PDF lama & hapus dari tabel sertifikat
      if (existingSertifikat.certificateUrl) {
        const oldFilePath = path.join(process.cwd(), "public", existingSertifikat.certificateUrl);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      
      await prisma.sertifikat.delete({ where: { id } });
      
      return NextResponse.json({ 
        message: "Data disimpan. Status menjadi tidak lulus sehingga sertifikat dicabut." 
      }, { status: 200 });
    }
    // --- JIKA TETAP LULUS, LANJUT RE-GENERATE PDF ---

    const finalName = namaPeserta || existingSertifikat.pendaftaran?.user?.name || "Nama Tidak Diketahui";
    const pelatihanName = existingSertifikat.pendaftaran?.jadwal?.pelatihan?.name || "Pelatihan";
    const finalIssuedAt = issuedAt ? new Date(issuedAt) : existingSertifikat.issuedAt;
    
    const tanggalTerbit = finalIssuedAt.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });

    // 5. PROSES RE-GENERATE PDF BARU
    const templatePath = path.join(process.cwd(), "public", "template-sertifikat.png");
    const templateBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedPng(templateBytes);
    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const namaPesertaKapital = finalName.toUpperCase();
    const nameFontSize = 80;
    const descFontSize = 30; 
    const centerY = height / 2;

    const yPosisiNama = centerY + 60;
    const yPosisiGaris = centerY - 10;
    const yPosisiDeskripsi1 = centerY - 80;
    const yPosisiDeskripsi2 = centerY - 120;

    const nameTextWidth = fontBold.widthOfTextAtSize(namaPesertaKapital, nameFontSize);
    page.drawText(namaPesertaKapital, {
      x: width / 2 - nameTextWidth / 2,
      y: yPosisiNama,
      size: nameFontSize, font: fontBold, color: rgb(0, 0, 0),
    });

    const panjangGaris = Math.max(nameTextWidth + 100, width * 0.7);
    page.drawLine({
      start: { x: width / 2 - panjangGaris / 2, y: yPosisiGaris },
      end: { x: width / 2 + panjangGaris / 2, y: yPosisiGaris },
      thickness: 2, color: rgb(0, 0, 0),
    });

    const descLine1 = `Telah menyelesaikan Pelatihan ${pelatihanName} yang`;
    const descLine2 = `diselenggarakan oleh Liceria & Co pada ${tanggalTerbit}`;

    const descWidth1 = fontRegular.widthOfTextAtSize(descLine1, descFontSize);
    page.drawText(descLine1, {
      x: width / 2 - descWidth1 / 2,
      y: yPosisiDeskripsi1, size: descFontSize, font: fontRegular, color: rgb(0.1, 0.1, 0.1),
    });

    const descWidth2 = fontRegular.widthOfTextAtSize(descLine2, descFontSize);
    page.drawText(descLine2, {
      x: width / 2 - descWidth2 / 2,
      y: yPosisiDeskripsi2, size: descFontSize, font: fontRegular, color: rgb(0.1, 0.1, 0.1),
    });

    // 6. Simpan File Baru
    const pdfBytes = await pdfDoc.save();
    const fileName = `Sertifikat-${finalName.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
    const savePath = path.join(process.cwd(), "public", "sertifikats", fileName);

    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(savePath, pdfBytes);

    const newCertificateUrl = `/sertifikats/${fileName}`;

    // 7. Hapus File PDF Lama
    if (existingSertifikat.certificateUrl) {
      const oldFilePath = path.join(process.cwd(), "public", existingSertifikat.certificateUrl);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath); 
    }

    // 8. Update Tabel Sertifikat
    const updatedSertifikat = await prisma.sertifikat.update({
      where: { id },
      data: {
        certificateUrl: newCertificateUrl,
        issuedAt: finalIssuedAt,
      },
    });

    return NextResponse.json(updatedSertifikat, { status: 200 });
  } catch (error) {
    console.error("Error updating sertifikat:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}

// DELETE: Menghapus data sertifikat
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Hapus file PDF fisik dari server saat dihapus via tombol Trash
    const sertifikat = await prisma.sertifikat.findUnique({ where: { id } });
    if (sertifikat && sertifikat.certificateUrl) {
      const filePath = path.join(process.cwd(), "public", sertifikat.certificateUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.sertifikat.delete({ where: { id } });
    return NextResponse.json({ message: "Sertifikat berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting sertifikat:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
