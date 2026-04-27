"use client";

import { useState, useEffect } from "react";
import { createPendaftaran, getJadwalList } from "@/server/pendaftaran";
import { type PendaftaranInput, type JadwalOption } from "@/server/pendaftaran.schema";

export function PendaftaranForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [jadwalList, setJadwalList] = useState<(JadwalOption & { pelatihanId: string })[]>([]);
  const [selectedJadwal, setSelectedJadwal] = useState<{
    jadwalId: string;
    pelatihanId: string;
    metode: string | null;
  } | null>(null);
  const [isLoadingJadwal, setIsLoadingJadwal] = useState(true);

  useEffect(() => {
    async function fetchJadwal() {
      try {
        const response = await getJadwalList();
        if (response.success && response.data) {
          setJadwalList(response.data as any);
        }
      } catch (error) {
        console.error("Gagal mengambil data jadwal:", error);
      } finally {
        setIsLoadingJadwal(false);
      }
    }
    fetchJadwal();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);

      if (!selectedJadwal) {
        setMessage({ type: "error", text: "Jadwal wajib dipilih" });
        setIsLoading(false);
        return;
      }

      const data: any = {
        namaLengkap: formData.get("namaLengkap") as string,
        email: formData.get("email") as string,
        noTelp: formData.get("noTelp") as string,
        pekerjaan: formData.get("pekerjaan") as string,
        instansi: formData.get("instansi") as string,
        jadwalId: selectedJadwal.jadwalId,
        pelatihanId: selectedJadwal.pelatihanId,
        metode: formData.get("metode") as "ONLINE" | "OFFLINE",
      };

      const filesToProcess = ["fotoKtp", "ijazah", "pasFoto", "buktiTransfer", "suratKerja"];

      // --- PERUBAHAN: Upload File via API UploadThing ---
      for (const field of filesToProcess) {
        const file = formData.get(field) as File;

        if (file && file.size > 0) {
          // Siapkan file untuk dikirim ke API
          const uploadData = new FormData();
          uploadData.append("file", file);

          // Panggil API upload yang sudah kita hubungkan ke UploadThing
          const uploadRes = await fetch("/api/pendaftaran/upload", {
            method: "POST",
            body: uploadData,
          });

          const uploadResult = await uploadRes.json();

          if (uploadResult.success) {
            // Simpan URL dari UploadThing (https://utfs.io/...) ke objek data
            data[field] = uploadResult.url;
          } else {
            throw new Error(`Gagal mengunggah ${field}`);
          }
        }
      }

      // Kirim data (yang sekarang berisi URL utfs.io, bukan Base64) ke database
      const response = await createPendaftaran(data as PendaftaranInput);

      if (response.success) {
        setMessage({ type: "success", text: "Pendaftaran berhasil dikirim! Silakan tunggu konfirmasi selanjutnya." });
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: "error", text: response.error || "Terjadi kesalahan saat menyimpan data." });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengunggah file. Pastikan ukuran file tidak terlalu besar." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      {message && <div className={`p-4 mb-6 rounded-lg font-medium ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INFORMASI PRIBADI */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white">Informasi Pribadi</h3>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input type="text" name="namaLengkap" required placeholder="Sesuai KTP" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" required placeholder="email@contoh.com" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                No. WhatsApp / Telepon <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="noTelp" required placeholder="081234567890" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Pekerjaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pekerjaan"
                required
                placeholder="Contoh: System Analyst"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Instansi / Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="instansi"
                required
                placeholder="Nama Perusahaan atau Kampus"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* DETAIL PELATIHAN & DOKUMEN */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white">Pelatihan & Dokumen</h3>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Pilih Jadwal <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-800"
                disabled={isLoadingJadwal}
                onChange={(e) => {
                  const jadwal = jadwalList.find((j) => j.id === e.target.value);
                  if (jadwal) {
                    setSelectedJadwal({
                      jadwalId: jadwal.id,
                      pelatihanId: jadwal.pelatihanId,
                      metode: jadwal.metode,
                    });
                  } else {
                    setSelectedJadwal(null);
                  }
                }}
              >
                <option value="">{isLoadingJadwal ? "Memuat data jadwal..." : "-- Pilih Jadwal --"}</option>
                {jadwalList.map((jadwal) => {
                  const tanggal = new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).format(new Date(jadwal.date));
                  const metodeText = jadwal.metode || "";
                  return (
                    <option key={jadwal.id} value={jadwal.id}>
                      {jadwal.pelatihanName} - {tanggal} {metodeText}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Metode Pelatihan <span className="text-red-500">*</span>
              </label>
              <select name="metode" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">-- Pilih Metode --</option>
                <option value="ONLINE">Online (Daring)</option>
                <option value="OFFLINE">Offline (Tatap Muka)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Upload Foto KTP <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="fotoKtp"
                accept="image/*"
                required
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Upload Ijazah <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="ijazah"
                accept="image/*,application/pdf"
                required
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Upload Pas Foto <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="pasFoto"
                accept="image/*"
                required
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Bukti Transfer <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="buktiTransfer"
                accept="image/*"
                required
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Surat Keterangan Kerja <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="file"
                name="suratKerja"
                accept="image/*,application/pdf"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses Pendaftaran...
              </>
            ) : (
              "Kirim Pendaftaran"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
