import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCertificatePDF } from "@/lib/generateSertifikat";

type RouteParams = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sertifikat = await prisma.sertifikat.findUnique({
      where: { id },
      include: { pendaftaran: { include: { user: true } } },
    });

    if (!sertifikat) return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });
    return NextResponse.json(sertifikat, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { namaPeserta, status, issuedAt } = body;

    const existingSertifikat = await prisma.sertifikat.findUnique({
      where: { id },
      include: {
        pendaftaran: { include: { user: true, jadwal: { include: { pelatihan: true } } } },
      },
    });

    if (!existingSertifikat) return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });

    if (existingSertifikat.pendaftaranId) {
      const updateData: any = {};
      if (namaPeserta) updateData.namaLengkap = namaPeserta;
      if (status) updateData.status = status;

      if (Object.keys(updateData).length > 0) {
        await prisma.pendaftaran.update({
          where: { id: existingSertifikat.pendaftaranId },
          data: updateData,
        });
      }

      if (namaPeserta && existingSertifikat.pendaftaran?.userId) {
        await prisma.user.update({
          where: { id: existingSertifikat.pendaftaran.userId },
          data: { name: namaPeserta },
        });
      }
    }

    if (status && status !== "LULUS") {
      await prisma.sertifikat.delete({ where: { id } });
      return NextResponse.json({ message: "Status tidak lulus, sertifikat dicabut." }, { status: 200 });
    }

    const finalName = namaPeserta || existingSertifikat.pendaftaran?.namaLengkap || existingSertifikat.pendaftaran?.user?.name || "Nama Tidak Diketahui";

    const pelatihanName = existingSertifikat.pendaftaran?.jadwal?.pelatihan?.name || "Pelatihan";
    const lokasi = existingSertifikat.pendaftaran?.jadwal?.location || "Feducation Jakarta";
    const finalIssuedAt = issuedAt ? new Date(issuedAt) : existingSertifikat.issuedAt;

    const urutPendaftar = await prisma.pendaftaran.count({
      where: { createdAt: { lte: existingSertifikat.pendaftaran?.createdAt || new Date() } },
    });

    // Akan otomatis ter-upload ke UploadThing
    const newCertificateUrl = await buildCertificatePDF({
      userName: finalName,
      pelatihanName,
      lokasi,
      tanggalTerbit: finalIssuedAt,
      urutPendaftar,
    });

    const updatedSertifikat = await prisma.sertifikat.update({
      where: { id },
      data: { certificateUrl: newCertificateUrl, issuedAt: finalIssuedAt },
    });

    return NextResponse.json(updatedSertifikat, { status: 200 });
  } catch (error) {
    console.error("Error updating sertifikat:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.sertifikat.delete({ where: { id } });
    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}
