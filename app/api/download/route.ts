import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  // Tangkap URL file yang dikirim dari frontend
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('file'); 

  if (!fileUrl) {
    return new NextResponse("URL file tidak diberikan", { status: 400 });
  }

  // Bersihkan slash '/' di depan agar path.join tidak salah baca
  const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  
  // Cari file fisiknya di dalam folder public
  const filePath = path.join(process.cwd(), 'public', cleanPath);

  // Cek apakah file benar-benar ada di hardisk/server
  if (!fs.existsSync(filePath)) {
    return new NextResponse("File PDF sedang diproses atau tidak ditemukan di server", { status: 404 });
  }

  // Baca file-nya
  const fileBuffer = fs.readFileSync(filePath);
  
  // Ambil nama filenya saja (misal: Sertifikat-User.pdf)
  const fileName = fileUrl.split('/').pop() || 'Sertifikat.pdf';

  // Paksa browser untuk mendownload file ini
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}