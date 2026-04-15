import { pool } from '@/lib/db';

export async function GET(
  req: Request,
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
  } catch (error: any) {
    return Response.json({ success: false, message: error.message });
  }
}

//delete
export async function DELETE(
  req: Request,
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
  } catch (error: any) {
    return Response.json({ success: false, message: error.message });
  }
}