import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Menjalankan seeder...")

  // Hapus data lama jika ada (agar tidak bentrok saat dijalankan ulang)
  await prisma.user.deleteMany()
  await prisma.pelatihan.deleteMany()

  // 1. Buat Akun Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin Sertifikasi",
      email: "admin@bnsp.com",
      password: "password123", // PERINGATAN: Di production harus menggunakan bcrypt (di-hash)
      role: "ADMIN",
      phone: "081234567890",
    },
  })
  console.log("Berhasil membuat Admin:", admin.email)

  // 2. Buat Akun User Biasa
  const user = await prisma.user.create({
    data: {
      name: "Andi Peserta",
      email: "peserta@gmail.com",
      password: "password123", // Sama, ini untuk testing
      role: "USER",
      phone: "089876543210",
    },
  })
  console.log("Berhasil membuat User Peserta:", user.email)

  // 3. Buat Data Pelatihan Dummy
  const pelatihan1 = await prisma.pelatihan.create({
    data: {
      kode: "WEB-DEV-001",
      nama: "Sertifikasi Junior Web Developer",
      deskripsi: "Pelatihan dan sertifikasi untuk menjadi Junior Web Developer kompeten.",
      jadwals: {
        create: [
          {
            tanggalMulai: new Date("2026-05-10T08:00:00Z"),
            tanggalSelesai: new Date("2026-05-15T15:00:00Z"),
            status: "PUBLISHED",
            kuota: 20,
            lokasi: "Gedung TUK Sewaktu, Jakarta",
          }
        ]
      }
    }
  })
  console.log("Berhasil membuat Pelatihan:", pelatihan1.nama)

  console.log("Seeding selesai!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
