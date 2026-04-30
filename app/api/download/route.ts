import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("file");

  // 1. Tangkap parameter "name" dari URL
  const userName = searchParams.get("name") || "Peserta";

  if (!fileUrl) {
    return new NextResponse("URL file tidak diberikan", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error("Gagal mengambil file dari server penyimpanan luar");
    }

    const arrayBuffer = await response.arrayBuffer();

    // 2. Bersihkan nama user dari spasi dan karakter spesial agar aman untuk nama file
    const safeUserName = userName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");

    // 3. Gabungkan nama file dengan nama user
    let fileName = fileUrl.split("/").pop();

    // Jika dari UploadThing (tidak ada ekstensi)
    if (!fileName || !fileName.includes(".")) {
      // Hasilnya misal: Sertifikat_Pelatihan_Budi_Santoso.pdf
      fileName = `Sertifikat_Pelatihan_${safeUserName}.pdf`;
    } else {
      // Jika ternyata URL-nya sudah ada ekstensinya, kita sisipkan namanya
      const nameParts = fileName.split(".");
      const ext = nameParts.pop(); // Ambil ekstensinya (misal: pdf)
      fileName = `Sertifikat_Pelatihan_${safeUserName}.${ext}`;
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("File PDF sedang diproses atau tidak ditemukan di server cloud", { status: 404 });
  }
}
