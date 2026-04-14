import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export const dynamic = 'force-dynamic'; 

// GET: Mengambil semua data sertifikat
export async function GET() {
  try {
    const sertifikat = await prisma.sertifikat.findMany({
      include: {
        pendaftaran: {
          include: {
            user: true, 
            jadwal: {
              include: {
                pelatihan: true 
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }); 
    return NextResponse.json(sertifikat, { status: 200 });
  } catch (error) { 
    console.error("Error fetching sertifikat:", error);
    return NextResponse.json({ error: "Gagal mengambil data sertifikat" }, { status: 500 });
  }
}

// POST: Membuat data sertifikat baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pendaftaranId, certificateUrl, issuedAt } = body;

    if (!pendaftaranId || !certificateUrl) {
      return NextResponse.json({ error: "pendaftaranId dan certificateUrl wajib diisi" }, { status: 400 });
    }

    const newSertifikat = await prisma.sertifikat.create({
      data: {
        pendaftaranId,
        certificateUrl,
        ...(issuedAt && { issuedAt: new Date(issuedAt) }),
      },
    });

    return NextResponse.json(newSertifikat, { status: 201 });
  } catch (error) {
    console.error("Error creating sertifikat:", error);
    return NextResponse.json({ error: "Gagal membuat sertifikat" }, { status: 500 });
  }
}