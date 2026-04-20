import { pool } from '@/lib/db';
import { randomUUID } from 'crypto';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan server';
}

export async function GET() {
  try {
    const result = await prisma.pendaftaran.findMany({
      include: {
        user: true,           
        jadwal: {
          include: {
            pelatihan: true,  
          },
        },
        sertifikats: true,     
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('ERROR:', error);

    return Response.json(
      { success: false, message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, jadwalId, documentUrl, status = 'MENUNGGU' } = body;

    if (!userId || !jadwalId) {
      return Response.json(
        { success: false, message: 'userId dan jadwalId wajib diisi' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO "Pendaftaran"
        ("id", "userId", "jadwalId", "documentUrl", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, String(userId), String(jadwalId), documentUrl, status]
    );

    return Response.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('POST ERROR:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// TAMBAHAN: Method PATCH untuk Update Status dari Dropdown
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json(
        { success: false, message: 'ID dan Status wajib diisi' },
        { status: 400 }
      );
    }

    const updatedData = await prisma.pendaftaran.update({
      where: { id: id },
      data: { status: status },
    });

    return Response.json({
      success: true,
      data: updatedData,
      message: 'Status berhasil diperbarui'
    });
  } catch (error: any) {
    console.error('PATCH ERROR:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
