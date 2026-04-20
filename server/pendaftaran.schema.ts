import { z } from "zod";

export const metodeEnum = z.enum(["ONLINE", "OFFLINE"]);

// Validasi untuk URL atau base64 data URL
const urlOrDataUrl = z.string()
  .min(1, "File harus diupload")
  .refine(
    (value) => {
      // Accept standard URLs
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('ftp://')) {
        return true;
      }
      // Accept base64 data URLs
      if (value.startsWith('data:')) {
        return true;
      }
      return false;
    },
    { message: "File harus berupa URL atau data URL" }
  );

export const pendaftaranSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),

  email: z
    .string()
    .email("Format email tidak valid"),

  noTelp: z.string().min(1, "No telp wajib diisi"),

  pekerjaan: z.string().min(1, "Pekerjaan wajib diisi"),

  instansi: z.string().min(1, "Instansi wajib diisi"),

  jadwalId: z.string().min(1, "Jadwal wajib dipilih"),

  pelatihanId: z.string().min(1, "Pelatihan wajib dipilih"),

  metode: metodeEnum,

  fotoKtp: urlOrDataUrl,

  ijazah: urlOrDataUrl,

  pasFoto: urlOrDataUrl,

  suratKerja: urlOrDataUrl.optional(),

  buktiTransfer: urlOrDataUrl,
});

export type PendaftaranInput = z.infer<typeof pendaftaranSchema>;

// Type untuk jadwal option di dropdown form
export type JadwalOption = {
  id: string;
  date: Date;
  metode: string | null;
  pelatihanName: string;
};