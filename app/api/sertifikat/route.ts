// api/sertifikat/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // SANGAT BERSIH: Hanya mengambil data dari database, tidak ada fungsi Generate di sini lagi!
    const sertifikat = await prisma.sertifikat.findMany({
      include: {
        pendaftaran: { include: { user: true, jadwal: { include: { pelatihan: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    }); 

    return NextResponse.json(sertifikat, { status: 200 });
  } catch (error) { 
    console.error("Error fetching sertifikat:", error);
    return NextResponse.json({ error: "Gagal mengambil data sertifikat" }, { status: 500 });
  }
}

// POST: Membuat data sertifikat baru & Generate PDF
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { pendaftaranId, issuedAt } = body;

//     if (!pendaftaranId) {
//       return NextResponse.json({ error: "pendaftaranId wajib diisi" }, { status: 400 });
//     }

//     // 1. Ambil data Pendaftaran untuk mendapatkan Nama & Pelatihan
//     const pendaftaran = await prisma.pendaftaran.findUnique({
//       where: { id: pendaftaranId },
//       include: {
//         user: true,
//         jadwal: {
//           include: { pelatihan: true }
//         }
//       }
//     });

//     if (!pendaftaran) {
//       return NextResponse.json({ error: "Data pendaftaran tidak ditemukan" }, { status: 404 });
//     }

//     // Opsional: Validasi agar hanya yang 'LULUS' yang bisa dibuatkan sertifikat
//     if (pendaftaran.status !== 'LULUS') {
//       return NextResponse.json({ error: "Peserta belum berstatus LULUS" }, { status: 400 });
//     }

//     const userName = pendaftaran.user?.name || "Nama Tidak Diketahui";
//     const pelatihanName = pendaftaran.jadwal?.pelatihan?.name || "Pelatihan";
    
//     // Format Tanggal: "14 April 2026"
//     const tanggalTerbit = issuedAt 
//       ? new Date(issuedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
//       : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

//     // 2. Load gambar template dari folder public
//     const templatePath = path.join(process.cwd(), 'public', 'template-sertifikat.png');
//     const templateBytes = fs.readFileSync(templatePath);

//     // 3. Buat dokumen PDF dan embed gambar
//     const pdfDoc = await PDFDocument.create();
//     const image = await pdfDoc.embedPng(templateBytes); // Gunakan embedJpg() jika template berekstensi .jpg
//     const { width, height } = image.scale(1);
//     const page = pdfDoc.addPage([width, height]);
    
//     // Jadikan gambar sebagai background penuh
//     page.drawImage(image, { x: 0, y: 0, width, height });

//     // 4. Konfigurasi Font
//     const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//     const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     // --- UBAH NAMA JADI HURUF BESAR (UPPERCASE) ---
//     const namaPeserta = userName.toUpperCase(); 

//     // --- PENGATURAN UKURAN FONT ---
//     const nameFontSize = 80; 
//     const descFontSize = 30; // Diperbesar dari 20 ke 30

//     // --- PENGATURAN KOORDINAT (Sumbu Y dimulai dari BAWAH) ---
//     const centerY = height / 2; 

//     // Menyesuaikan posisi agar ada jeda yang pas
//     const yPosisiNama = centerY + 60;        // Nama naik sedikit
//     const yPosisiGaris = centerY - 10;       // Garis tetap di tengah area
//     const yPosisiDeskripsi1 = centerY - 80;  // Jarak dari garis ke teks (jeda diperlebar)
//     const yPosisiDeskripsi2 = centerY - 120; // Jarak antar baris teks

//     // 4A. MENULIS NAMA PESERTA
//     const nameTextWidth = fontBold.widthOfTextAtSize(namaPeserta, nameFontSize);
//     page.drawText(namaPeserta, {
//       x: (width / 2) - (nameTextWidth / 2),
//       y: yPosisiNama, 
//       size: nameFontSize,
//       font: fontBold,
//       color: rgb(0, 0, 0),
//     });

//     // 4B. MENGGAMBAR GARIS PEMISAH
//     const panjangGaris = Math.max(nameTextWidth + 100, width * 0.7); 
//     page.drawLine({
//       start: { x: (width / 2) - (panjangGaris / 2), y: yPosisiGaris },
//       end: { x: (width / 2) + (panjangGaris / 2), y: yPosisiGaris },
//       thickness: 2, // Garis dibuat sedikit lebih tebal agar tegas
//       color: rgb(0, 0, 0),
//     });

//     // 4C. MENULIS TEKS DESKRIPSI (2 BARIS)
//     const descLine1 = `Telah menyelesaikan Pelatihan ${pelatihanName} yang`;
//     const descLine2 = `diselenggarakan oleh Liceria & Co pada ${tanggalTerbit}`;

//     // Baris 1
//     const descWidth1 = fontRegular.widthOfTextAtSize(descLine1, descFontSize);
//     page.drawText(descLine1, {
//       x: (width / 2) - (descWidth1 / 2),
//       y: yPosisiDeskripsi1, 
//       size: descFontSize,
//       font: fontRegular,
//       color: rgb(0.1, 0.1, 0.1), // Warna dibuat agak lebih gelap
//     });

//     // Baris 2
//     const descWidth2 = fontRegular.widthOfTextAtSize(descLine2, descFontSize);
//     page.drawText(descLine2, {
//       x: (width / 2) - (descWidth2 / 2),
//       y: yPosisiDeskripsi2, 
//       size: descFontSize,
//       font: fontRegular,
//       color: rgb(0.1, 0.1, 0.1), 
//     });

//     // 5. Simpan file PDF secara lokal di public/sertifikats
//     const pdfBytes = await pdfDoc.save();
//     const fileName = `Sertifikat-${userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
//     const savePath = path.join(process.cwd(), 'public', 'sertifikats', fileName);
    
//     // Pastikan foldernya ada
//     const dir = path.dirname(savePath);
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
//     fs.writeFileSync(savePath, pdfBytes);

//     // Ini URL lokal yang akan disimpan ke database
//     const certificateUrl = `/sertifikats/${fileName}`; 

//     // 6. Simpan URL ke Database
//     const newSertifikat = await prisma.sertifikat.create({
//       data: {
//         pendaftaranId,
//         certificateUrl,
//         ...(issuedAt && { issuedAt: new Date(issuedAt) }),
//       },
//     });

//     return NextResponse.json(newSertifikat, { status: 201 });
//   } catch (error) {
//     console.error("Error creating sertifikat:", error);
//     return NextResponse.json({ error: "Gagal membuat sertifikat" }, { status: 500 });
//   }
// }