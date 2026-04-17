import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const pelatihans = await prisma.pelatihan.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: pelatihans,
    })
  } catch (error) {
    console.error("GET PELATIHAN ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data pelatihan",
      },
      { status: 500 }
    )
  }
}
