import { pool } from '@/lib/db';
import { randomUUID } from 'crypto';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan server';
}

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM "Jadwal"
      ORDER BY "createdAt" DESC
    `);

    return Response.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('GET JADWAL ERROR:', error);

    return Response.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { date, location, pelatihanId, metode, status } = body;

    if (!date || !location || !pelatihanId) {
      return Response.json(
        {
          success: false,
          message: 'Semua field wajib diisi',
        },
        { status: 400 }
      );
    }

    const id = randomUUID();

    const result = await pool.query(
  `INSERT INTO "Jadwal"
    ("id", "date", "location", "pelatihanId", "metode", "status", "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
   RETURNING *`,
  [
    id,
    date,
    location,
    String(pelatihanId),
    metode,
    status,
  ]
);

    return Response.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('POST JADWAL ERROR:', error);

    return Response.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
