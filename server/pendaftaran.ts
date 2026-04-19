"use server";

import { prisma } from "@/lib/prisma";
import { pendaftaranSchema, type PendaftaranInput } from "@/server/pendaftaran.schema";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// ============================================================================
// HELPER FUNCTION: Menyimpan Base64 menjadi file fisik
// ============================================================================
async function saveBase64File(base64Data: string, prefix: string): Promise<string> {
  // Jika sudah berupa URL biasa (bukan base64), langsung return
  if (!base64Data.startsWith("data:")) return base64Data;

  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error("Format file tidak valid");

  const mimeType = matches[1];
  const base64String = matches[2];
  const buffer = Buffer.from(base64String, "base64");
  
  // Ambil ekstensi (contoh: image/jpeg -> jpeg)
  const extension = mimeType.split("/")[1] || "png";
  // Buat nama file unik agar tidak tertimpa
  const fileName = `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${extension}`;
  
  const dirPath = path.join(process.cwd(), "public", "pendaftarans");
  const filePath = path.join(dirPath, fileName);

  try {
    // Pastikan folder ada, jika tidak buat otomatis
    await mkdir(dirPath, { recursive: true });
    await writeFile(filePath, buffer);
    return `/pendaftarans/${fileName}`;
  } catch (error) {
    console.error(`Gagal menyimpan file ${prefix}:`, error);
    throw new Error(`Gagal menyimpan file ${prefix}`);
  }
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export async function createPendaftaran(data: PendaftaranInput) {
  try {
    console.log("[PENDAFTARAN] Memvalidasi data dengan Zod...");
    const validatedData = pendaftaranSchema.parse(data);

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

    console.log("[PENDAFTARAN] Menyimpan file ke folder public/pendaftarans...");
    // Simpan file satu per satu dan dapatkan URL-nya
    const fotoKtpUrl = await saveBase64File(validatedData.fotoKtp, "ktp");
    const ijazahUrl = await saveBase64File(validatedData.ijazah, "ijazah");
    const pasFotoUrl = await saveBase64File(validatedData.pasFoto, "pasfoto");
    const buktiTransferUrl = await saveBase64File(validatedData.buktiTransfer, "transfer");
    
    let suratKerjaUrl = null;
    if (validatedData.suratKerja) {
      suratKerjaUrl = await saveBase64File(validatedData.suratKerja, "suratkerja");
    }

    console.log("[PENDAFTARAN] Membuat record pendaftaran di database...");
    
    // Replace base64 strings di data dengan URL fisik sebelum masuk ke Prisma
    const pendaftaranData = {
      ...validatedData,
      fotoKtp: fotoKtpUrl,
      ijazah: ijazahUrl,
      pasFoto: pasFotoUrl,
      buktiTransfer: buktiTransferUrl,
      suratKerja: suratKerjaUrl || undefined,
    };

    // Create pendaftaran
    const pendaftaran = await prisma.pendaftaran.create({
      data: pendaftaranData,
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