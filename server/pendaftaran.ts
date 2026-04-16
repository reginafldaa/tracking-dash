"use server";

import { prisma } from "@/lib/prisma";
import { pendaftaranSchema, type PendaftaranInput } from "@/server/pendaftaran.schema";
import { revalidatePath } from "next/cache";

export async function createPendaftaran(data: PendaftaranInput) {
  try {
    console.log("[PENDAFTARAN] Menerima data:", {
      namaLengkap: data.namaLengkap,
      email: data.email,
      pelatihanId: data.pelatihanId,
      metode: data.metode,
      hasFiles: {
        fotoKtp: !!data.fotoKtp?.substring(0, 50),
        ijazah: !!data.ijazah?.substring(0, 50),
        pasFoto: !!data.pasFoto?.substring(0, 50),
        buktiTransfer: !!data.buktiTransfer?.substring(0, 50),
      },
    });

    // Validasi data dengan Zod
    console.log("[PENDAFTARAN] Memvalidasi data dengan Zod...");
    const validatedData = pendaftaranSchema.parse(data);
    console.log("[PENDAFTARAN] ✓ Validasi Zod berhasil");

    // Check apakah user sudah mendaftar pelatihan ini
    console.log(`[PENDAFTARAN] Checking duplikat: email=${validatedData.email}, pelatihanId=${validatedData.pelatihanId}`);
    const existing = await prisma.pendaftaran.findFirst({
      where: {
        email: validatedData.email,
        pelatihanId: validatedData.pelatihanId,
      },
    });

    if (existing) {
      console.log("[PENDAFTARAN] ✗ Sudah terdaftar: ID=", existing.id);
      return {
        success: false,
        error: "Anda sudah mendaftar untuk pelatihan ini",
      };
    }

    console.log("[PENDAFTARAN] Membuat record pendaftaran...");
    // Create pendaftaran
    const pendaftaran = await prisma.pendaftaran.create({
      data: validatedData,
      include: {
        pelatihan: true,
      },
    });
    console.log("[PENDAFTARAN] ✓ Record berhasil dibuat: ID=", pendaftaran.id);

    revalidatePath("/dashboard/user/pendaftaran");

    return {
      success: true,
      data: pendaftaran,
    };
  } catch (error) {
    console.error("[PENDAFTARAN] ✗ ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal membuat pendaftaran";
    console.error("[PENDAFTARAN] Error message:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getPendaftaranByEmail(email: string) {
  try {
    const pendaftaran = await prisma.pendaftaran.findMany({
      where: { email },
      include: {
        pelatihan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: pendaftaran,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal mengambil data pendaftaran",
    };
  }
}

export async function getPelatihanList() {
  try {
    const pelatihans = await prisma.pelatihan.findMany({
      where: { status: true },
      select: {
        id: true,
        name: true,
        tanggal: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return {
      success: true,
      data: pelatihans,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal mengambil daftar pelatihan",
    };
  }
}
