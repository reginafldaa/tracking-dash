"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const absensiSchema = z.object({
  pendaftaranId: z.string().min(1, "ID Pendaftaran diperlukan"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
})

export async function getAbsensiData(filters?: {
  pelatihanId?: string
  jadwalId?: string
  status?: "hadir" | "tidak_hadir" | "belum"
  startDate?: Date
  endDate?: Date
  searchNama?: string
}) {
  try {
    const absensiData = await prisma.absensi.findMany({
      include: {
        pendaftaran: {
          include: {
            user: true,
            jadwal: {
              include: {
                pelatihan: true,
              },
            },
          },
        },
      },
    })

    // Filter data berdasarkan kriteria
    let filtered = absensiData

    if (filters?.pelatihanId) {
      filtered = filtered.filter(
        (a) => a.pendaftaran.jadwal.pelatihanId === filters.pelatihanId
      )
    }

    if (filters?.jadwalId) {
      filtered = filtered.filter((a) => a.pendaftaran.jadwalId === filters.jadwalId)
    }

    if (filters?.searchNama) {
      const search = filters.searchNama.toLowerCase()
      filtered = filtered.filter((a) =>
        a.pendaftaran.user.name?.toLowerCase().includes(search)
      )
    }

    if (filters?.startDate && filters?.endDate) {
      filtered = filtered.filter((a) => {
        const createdDate = new Date(a.createdAt)
        return createdDate >= filters.startDate! && createdDate <= filters.endDate!
      })
    }

    if (filters?.status) {
      filtered = filtered.filter((a) => {
        if (filters.status === "hadir") return a.checkIn && a.checkOut
        if (filters.status === "tidak_hadir") return !a.checkIn && !a.checkOut
        if (filters.status === "belum") return a.checkIn && !a.checkOut
        return true
      })
    }

    return { success: true, data: filtered }
  } catch (error) {
    console.error("Error fetching absensi data:", error)
    return { success: false, error: "Gagal mengambil data absensi", data: [] }
  }
}

export async function getPelatihanList() {
  try {
    const pelatihans = await prisma.pelatihan.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: pelatihans }
  } catch (error) {
    return { success: false, error: "Gagal mengambil data pelatihan", data: [] }
  }
}

export async function getJadwalList(pelatihanId?: string) {
  try {
    let where: any = {}
    if (pelatihanId) {
      where.pelatihanId = pelatihanId
    }

    const jadwals = await prisma.jadwal.findMany({
      where,
      select: {
        id: true,
        date: true,
        location: true,
        pelatihan: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })
    return { success: true, data: jadwals }
  } catch (error) {
    return { success: false, error: "Gagal mengambil data jadwal", data: [] }
  }
}

export async function updateAbsensi(formData: FormData) {
  try {
    const rawData = {
      pendaftaranId: formData.get("pendaftaranId") as string,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
    }

    const validatedData = absensiSchema.parse(rawData)

    // Find existing absensi record
    const existingAbsensi = await prisma.absensi.findFirst({
      where: { pendaftaranId: validatedData.pendaftaranId },
    })

    if (existingAbsensi) {
      await prisma.absensi.update({
        where: { id: existingAbsensi.id },
        data: {
          checkIn: validatedData.checkIn ? new Date(validatedData.checkIn) : null,
          checkOut: validatedData.checkOut ? new Date(validatedData.checkOut) : null,
        },
      })
    } else {
      await prisma.absensi.create({
        data: {
          pendaftaranId: validatedData.pendaftaranId,
          checkIn: validatedData.checkIn ? new Date(validatedData.checkIn) : null,
          checkOut: validatedData.checkOut ? new Date(validatedData.checkOut) : null,
        },
      })
    }

    revalidatePath("/dashboard/admin/absensi")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal mengupdate data absensi" }
  }
}

export async function getAbsensiStatistics(filters?: {
  pelatihanId?: string
  jadwalId?: string
  startDate?: Date
  endDate?: Date
}) {
  try {
    const absensiData = await getAbsensiData(filters)

    if (!absensiData.success || !absensiData.data) {
      return {
        total: 0,
        hadir: 0,
        tidakHadir: 0,
        belum: 0,
        persentaseKehadiran: 0,
      }
    }

    const data = absensiData.data
    const total = data.length
    const hadir = data.filter((a) => a.checkIn && a.checkOut).length
    const tidakHadir = data.filter((a) => !a.checkIn && !a.checkOut).length
    const belum = data.filter((a) => a.checkIn && !a.checkOut).length

    const persentaseKehadiran = total > 0 ? Math.round((hadir / total) * 100) : 0

    return {
      total,
      hadir,
      tidakHadir,
      belum,
      persentaseKehadiran,
    }
  } catch (error) {
    return {
      total: 0,
      hadir: 0,
      tidakHadir: 0,
      belum: 0,
      persentaseKehadiran: 0,
    }
  }
}

export async function getAbsensiTrendData() {
  try {
    const last7Days = await prisma.absensi.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return { success: true, data: last7Days }
  } catch (error) {
    return { success: false, error: "Gagal mengambil trend data", data: [] }
  }
}
