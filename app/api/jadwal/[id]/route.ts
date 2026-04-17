import { pool } from '@/lib/db';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan server';
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const result = await pool.query(
    `SELECT * FROM "Jadwal" WHERE id = $1`,
    [id]
  );

  return Response.json({
  success: true,
  data: result.rows[0],
});
}

//put
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { date, location, pelatihanId, metode, status } = body;

    const result = await pool.query(
  `UPDATE "Jadwal"
   SET "date" = $1,
       "location" = $2,
       "pelatihanId" = $3,
       "metode" = $4,
       "status" = $5,
       "updatedAt" = NOW()
   WHERE id = $6
   RETURNING *`,
  [date, location, String(pelatihanId), metode, status, params.id]
);

    if (result.rowCount === 0) {
  return Response.json({
    success: false,
    message: 'Data tidak ditemukan',
  });
}

    return Response.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return Response.json({ success: false, message: getErrorMessage(error) });
  }
}

//delete
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
   const result = await pool.query(
  `DELETE FROM "Jadwal" WHERE id = $1 RETURNING *`,
  [params.id]
);

if (result.rowCount === 0) {
  return Response.json({
    success: false,
    message: 'Data tidak ditemukan',
  });
}

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: getErrorMessage(error) });
  }
}
