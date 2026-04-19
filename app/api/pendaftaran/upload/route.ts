import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    console.log("FILE:", file);

    if (!file) {
      return Response.json({ success: false, message: "File tidak ditemukan" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/pendaftarans");

    console.log("DIR:", uploadDir);

    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return Response.json({
      success: true,
      url: `/pendaftarans/${fileName}`,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Upload gagal",
      },
      { status: 500 }
    );
  }
}