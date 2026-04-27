import { utapi } from "@/lib/uploadthing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ success: false, message: "File tidak ditemukan" });
    }

    // --- PERBAIKAN: "Cuci" Web File menjadi Node Buffer ---
    // 1. Ekstrak data mentah dari file browser
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Bungkus ulang menjadi File yang bersih dan dikenali oleh UploadThing
    const cleanFile = new File([buffer], file.name, { type: file.type });

    // 3. Lempar ke UploadThing
    const uploadResponse = await utapi.uploadFiles(cleanFile);

    if (uploadResponse.error) {
      throw new Error(uploadResponse.error.message);
    }

    return Response.json({
      success: true,
      url: uploadResponse.data.url, // URL permanen utfs.io
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return Response.json({ success: false, message: error.message || "Upload gagal" }, { status: 500 });
  }
}
