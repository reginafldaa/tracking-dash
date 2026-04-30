import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { buildCertificatePDF } from "@/lib/generateSertifikat";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan server";
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
        createdAt: "desc",
      },
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error("ERROR:", error);
    return Response.json({ success: false, message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, jadwalId, documentUrl, status = "MENUNGGU" } = body;

    if (!userId || !jadwalId) {
      return Response.json({ success: false, message: "userId dan jadwalId wajib diisi" }, { status: 400 });
    }

    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO "Pendaftaran"
        ("id", "userId", "jadwalId", "documentUrl", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, String(userId), String(jadwalId), documentUrl, status],
    );

    return Response.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("POST ERROR:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ success: false, message: "ID dan Status wajib diisi" }, { status: 400 });
    }

    const updatedPendaftaran = await prisma.pendaftaran.update({
      where: { id: id },
      data: { status: status },
      include: { user: true, jadwal: { include: { pelatihan: true } } },
    });

    const existingSertifikat = await prisma.sertifikat.findFirst({
      where: { pendaftaranId: id },
    });

    if (status === "LULUS" && !existingSertifikat) {
      const userName = updatedPendaftaran.namaLengkap || updatedPendaftaran.user?.name || "Nama Tidak Diketahui";
      const pelatihanName = updatedPendaftaran.jadwal?.pelatihan?.name || "Pelatihan";
      const lokasi = updatedPendaftaran.jadwal?.location || "Feducation Jakarta";
      const tanggalTerbit = new Date();

      const urutPendaftar = await prisma.pendaftaran.count({
        where: { createdAt: { lte: updatedPendaftaran.createdAt } },
      });

      // Ini sekarang akan mengembalikan URL utfs.io/...
      const certificateUrl = await buildCertificatePDF({
        userName,
        pelatihanName,
        lokasi,
        tanggalTerbit,
        urutPendaftar,
      });

      await prisma.sertifikat.create({
        data: {
          pendaftaranId: id,
          certificateUrl,
          issuedAt: tanggalTerbit,
        },
      });
    } else if (status !== "LULUS" && existingSertifikat) {
      // Hapus data sertifikat di database
      await prisma.sertifikat.delete({ where: { id: existingSertifikat.id } });
    }

    return Response.json({
      success: true,
      data: updatedPendaftaran,
      message: "Status berhasil diperbarui dan sertifikat disesuaikan",
    });
  } catch (error: any) {
    console.error("PATCH ERROR:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
