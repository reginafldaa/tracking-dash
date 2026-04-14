import { pool } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM "Pendaftaran"
      ORDER BY "createdAt" DESC
    `);

    return Response.json({
      success: true,
      data: result.rows,
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