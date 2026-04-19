"use client";

import { useState, useEffect } from "react";
import { createPendaftaran, getPelatihanList } from "@/server/pendaftaran";
import { type PendaftaranInput } from "@/server/pendaftaran.schema";

// Tipe data untuk daftar pelatihan
type PelatihanOption = {
  id: string;
  name: string;
};

export function PendaftaranForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pelatihanList, setPelatihanList] = useState<PelatihanOption[]>([]);
  const [isLoadingPelatihan, setIsLoadingPelatihan] = useState(true);

  // Mengambil daftar pelatihan saat komponen pertama kali dimuat
  useEffect(() => {
    async function fetchPelatihan() {
      try {
        const response = await getPelatihanList();
        if (response.success && response.data) {
          setPelatihanList(response.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data pelatihan:", error);
      } finally {
        setIsLoadingPelatihan(false);
      }
    }
    fetchPelatihan();
  }, []);

  // Helper untuk mengubah File menjadi Base64 (Data URL)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Mengumpulkan data teks standar
      const data: any = {
        namaLengkap: formData.get("namaLengkap") as string,
        email: formData.get("email") as string,
        noTelp: formData.get("noTelp") as string,
        pekerjaan: formData.get("pekerjaan") as string,
        instansi: formData.get("instansi") as string,
        pelatihanId: formData.get("pelatihanId") as string,
        metode: formData.get("metode") as "ONLINE" | "OFFLINE",
      };

      // Daftar field file yang wajib dan opsional sesuai skema
      const filesToProcess = ["fotoKtp", "ijazah", "pasFoto", "buktiTransfer", "suratKerja"];
      
      for (const field of filesToProcess) {
        const file = formData.get(field) as File;
        // Hanya proses jika file ada dan ukurannya lebih dari 0
        if (file && file.size > 0) {
          data[field] = await fileToBase64(file);
        }
      }

      // Panggil Server Action
      const response = await createPendaftaran(data as PendaftaranInput);

      if (response.success) {
        setMessage({ type: "success", text: "Pendaftaran berhasil dikirim! Silakan tunggu konfirmasi selanjutnya." });
        (e.target as HTMLFormElement).reset(); // Kosongkan form setelah sukses
      } else {
        setMessage({ type: "error", text: response.error || "Terjadi kesalahan saat menyimpan data." });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan sistem saat mengirim data." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      
      {/* Banner Notifikasi Pesan */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* INFORMASI PRIBADI */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white">Informasi Pribadi</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" name="namaLengkap" required placeholder="Sesuai KTP" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" required placeholder="email@contoh.com" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">No. WhatsApp / Telepon <span className="text-red-500">*</span></label>
              <input type="tel" name="noTelp" required placeholder="081234567890" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pekerjaan <span className="text-red-500">*</span></label>
              <input type="text" name="pekerjaan" required placeholder="Contoh: System Analyst" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Instansi / Perusahaan <span className="text-red-500">*</span></label>
              <input type="text" name="instansi" required placeholder="Nama Perusahaan atau Kampus" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          {/* DETAIL PELATIHAN & DOKUMEN */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white">Pelatihan & Dokumen</h3>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pilih Pelatihan <span className="text-red-500">*</span></label>
              <select name="pelatihanId" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-800" disabled={isLoadingPelatihan}>
                <option value="">{isLoadingPelatihan ? "Memuat data pelatihan..." : "-- Pilih Pelatihan --"}</option>
                {pelatihanList.map((pelatihan) => (
                  <option key={pelatihan.id} value={pelatihan.id}>
                    {pelatihan.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Metode Pelatihan <span className="text-red-500">*</span></label>
              <select name="metode" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">-- Pilih Metode --</option>
                <option value="ONLINE">Online (Daring)</option>
                <option value="OFFLINE">Offline (Tatap Muka)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Upload Foto KTP <span className="text-red-500">*</span></label>
              <input type="file" name="fotoKtp" accept="image/*" required className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Upload Ijazah <span className="text-red-500">*</span></label>
              <input type="file" name="ijazah" accept="image/*,application/pdf" required className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Upload Pas Foto <span className="text-red-500">*</span></label>
              <input type="file" name="pasFoto" accept="image/*" required className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bukti Transfer <span className="text-red-500">*</span></label>
              <input type="file" name="buktiTransfer" accept="image/*" required className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Surat Keterangan Kerja <span className="text-gray-400 font-normal">(Opsional)</span></label>
              <input type="file" name="suratKerja" accept="image/*,application/pdf" className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:file:bg-gray-600 dark:file:text-white" />
            </div>

          </div>
        </div>

        {/* SUBMIT BUTTON */}
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
            ) : "Kirim Pendaftaran"}
          </button>
        </div>
      </form>
    </div>
  );
}