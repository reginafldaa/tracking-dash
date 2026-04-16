import { pool } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const db = await pool.query(`SELECT current_database()`);
    console.log('CONNECTED DB:', db.rows[0]);
    const result = await pool.query(`
      SELECT *
      FROM "Jadwal"
      ORDER BY "createdAt" DESC
    `);

    return Response.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('GET JADWAL ERROR:', error);

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

    console.log('BODY:', body);

    const { date, location, pelatihanId, metode, status } = body;

    console.log('date:', date);
    console.log('location:', location);
    console.log('pelatihanId:', pelatihanId);
    console.log('metode:', metode);
    console.log('status:', status);

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
console.log('RESULT ROWS:', result.rows);
console.log('ROW COUNT:', result.rowCount);

    return Response.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('POST JADWAL ERROR:', error);
    console.error('STACK:', error?.stack);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}