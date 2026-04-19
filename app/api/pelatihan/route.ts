import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.pelatihan.findMany({
      where: { status: true }, 
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('GET PELATIHAN ERROR:', error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
