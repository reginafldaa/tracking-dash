"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { pelatihanSchema } from "./pelatihan.schema";

const prisma = new PrismaClient();

export async function getPelatihans(query?: string, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = query
      ? {
          name: {
            contains: query,
            mode: "insensitive" as const,
          },
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.pelatihan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.pelatihan.count({ where }),
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching pelatihan:", error);
    throw new Error("Failed to fetch pelatihan");
  }
}

export async function getPelatihanById(id: string) {
  try {
    const pelatihan = await prisma.pelatihan.findUnique({
      where: { id },
    });
    return pelatihan;
  } catch (error) {
    console.error(`Error fetching pelatihan with id ${id}:`, error);
    throw new Error("Failed to fetch pelatihan");
  }
}

export async function createPelatihan(data: unknown) {
  try {
    const parsedData = pelatihanSchema.parse(data);

    await prisma.pelatihan.create({
      data: parsedData,
    });

    revalidatePath("/dashboard/admin/pelatihan");
    return { success: true };
  } catch (error) {
    console.error("Error creating pelatihan:", error);
    return { success: false, error: "Failed to create pelatihan" };
  }
}

export async function updatePelatihan(id: string, data: unknown) {
  try {
    const parsedData = pelatihanSchema.parse(data);

    await prisma.pelatihan.update({
      where: { id },
      data: parsedData,
    });

    revalidatePath("/dashboard/admin/pelatihan");
    return { success: true };
  } catch (error) {
    console.error("Error updating pelatihan:", error);
    return { success: false, error: "Failed to update pelatihan" };
  }
}

export async function deletePelatihan(id: string) {
  try {
    await prisma.pelatihan.delete({
      where: { id },
    });

    revalidatePath("/dashboard/admin/pelatihan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pelatihan:", error);
    return { success: false, error: "Failed to delete pelatihan" };
  }
}
