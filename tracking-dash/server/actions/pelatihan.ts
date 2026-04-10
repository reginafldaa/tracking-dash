"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const pelatihanSchema = z.object({
  kode: z.string().min(3, "Kode pelatihan minimal 3 karakter"),
  nama: z.string().min(5, "Nama pelatihan minimal 5 karakter"),
  deskripsi: z.string().optional(),
})

export async function getPelatihans() {
  try {
    const data = await prisma.pelatihan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { jadwals: true }
        }
      }
    })
    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Gagal mengambil data pelatihan" }
  }
}

export async function createPelatihan(formData: FormData) {
  try {
    const rawData = {
      kode: formData.get("kode") as string,
      nama: formData.get("nama") as string,
      deskripsi: formData.get("deskripsi") as string,
    }

    const validatedData = pelatihanSchema.parse(rawData)

    // Cek apakah kode sudah digunakan
    const existing = await prisma.pelatihan.findUnique({
      where: { kode: validatedData.kode }
    })

    if (existing) {
      return { success: false, error: "Kode pelatihan sudah digunakan" }
    }

    await prisma.pelatihan.create({
      data: validatedData,
    })

    revalidatePath("/dashboard/admin/pelatihan")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat menyimpan data" }
  }
}

export async function deletePelatihan(id: string) {
  try {
    await prisma.pelatihan.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/pelatihan")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menghapus data" }
  }
}
