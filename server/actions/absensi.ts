"use server"

import { prisma } from "@/lib/prisma"
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
      orderBy: {
        createdAt: "desc",
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
    const absensiData = await prisma.absensi.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return { success: true, data: absensiData }
  } catch (error) {
    return { success: false, error: "Gagal mengambil trend data", data: [] }
  }
}

// User actions for self-service attendance
export async function getUserRegistrations(userId: string) {
  try {
    const registrations = await prisma.pendaftaran.findMany({
      where: { userId },
      include: {
        jadwal: {
          include: {
            pelatihan: true,
          },
        },
        absensis: true,
      },
      orderBy: {
        jadwal: {
          date: "desc",
        },
      },
    })

    return { success: true, data: registrations }
  } catch (error) {
    console.error("Error fetching user registrations:", error)
    return { success: false, error: "Gagal mengambil data pendaftaran", data: [] }
  }
}

export async function getUserAbsensiStatus(userId: string, jadwalId?: string) {
  try {
    const where: any = {
      pendaftaran: {
        userId,
      },
    }

    if (jadwalId) {
      where.pendaftaran = {
        ...where.pendaftaran,
        jadwalId,
      }
    }

    const absensis = await prisma.absensi.findMany({
      where,
      include: {
        pendaftaran: {
          include: {
            jadwal: {
              include: {
                pelatihan: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: absensis }
  } catch (error) {
    console.error("Error fetching user absensi status:", error)
    return { success: false, error: "Gagal mengambil data absensi", data: [] }
  }
}

export async function submitCheckIn(pendaftaranId: string) {
  try {
    // Check if registration exists
    const registration = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
    })

    if (!registration) {
      return { success: false, error: "Pendaftaran tidak ditemukan" }
    }

    // Check if absensi record exists
    let absensi = await prisma.absensi.findFirst({
      where: { pendaftaranId },
    })

    if (absensi && absensi.checkIn) {
      return { success: false, error: "Anda sudah melakukan check-in" }
    }

    const now = new Date()

    if (absensi) {
      absensi = await prisma.absensi.update({
        where: { id: absensi.id },
        data: { checkIn: now },
      })
    } else {
      absensi = await prisma.absensi.create({
        data: {
          pendaftaranId,
          checkIn: now,
        },
      })
    }

    revalidatePath("/dashboard/user")
    return { success: true, data: absensi }
  } catch (error) {
    console.error("Error submitting check-in:", error)
    return { success: false, error: "Gagal melakukan check-in" }
  }
}

export async function submitCheckOut(pendaftaranId: string) {
  try {
    // Check if registration exists
    const registration = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
    })

    if (!registration) {
      return { success: false, error: "Pendaftaran tidak ditemukan" }
    }

    // Check if absensi record exists and has check-in
    const absensi = await prisma.absensi.findFirst({
      where: { pendaftaranId },
    })

    if (!absensi) {
      return { success: false, error: "Belum ada data absensi, lakukan check-in terlebih dahulu" }
    }

    if (!absensi.checkIn) {
      return { success: false, error: "Anda belum melakukan check-in" }
    }

    if (absensi.checkOut) {
      return { success: false, error: "Anda sudah melakukan check-out" }
    }

    const now = new Date()

    const updatedAbsensi = await prisma.absensi.update({
      where: { id: absensi.id },
      data: { checkOut: now },
    })

    revalidatePath("/dashboard/user")
    return { success: true, data: updatedAbsensi }
  } catch (error) {
    console.error("Error submitting check-out:", error)
    return { success: false, error: "Gagal melakukan check-out" }
  }
}
