import { pool } from '@/lib/db';
import { randomUUID } from 'crypto';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Kita gunakan Prisma di GET agar otomatis menyusun relasi tabel menjadi JSON yang rapi
    const result = await prisma.pendaftaran.findMany({
      include: {
        user: true,           // Ambil email/nama user untuk dicocokkan dengan session
        jadwal: {
          include: {
            pelatihan: true,  // Ambil judul pelatihannya
          },
        },
        sertifikats: true,     // Ambil data sertifikatnya (URL pdf-nya)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('GET ERROR:', error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      jadwalId,
      documentUrl,
      status = 'pending',
    } = body;

    // Validasi
    if (!userId || !jadwalId) {
      return Response.json(
        {
          success: false,
          message: 'userId dan jadwalId wajib diisi',
        },
        { status: 400 }
      );
    }

    const id = randomUUID();

    const result = await pool.query(
      `INSERT INTO "Pendaftaran"
        ("id", "userId", "jadwalId", "documentUrl", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        id,
        String(userId),      
        String(jadwalId),    
        documentUrl,
        status,
      ]
    );

    return Response.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('POST ERROR:', error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}