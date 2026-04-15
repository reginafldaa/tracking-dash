"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Skema Validasi diubah (certificateUrl dihapus)
const sertifikatSchema = z.object({
  pendaftaranId: z.string().min(1, "Silakan pilih data peserta (Pendaftaran)"),
  issuedAt: z.string().min(1, "Tanggal terbit wajib diisi"),
});

interface PendaftaranDropdown {
  id: string;
  status: string;
  user?: { name: string | null; email: string };
  jadwal?: { pelatihan?: { title: string } };
}

export default function CreateSertifikatPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pendaftaranList, setPendaftaranList] = useState<PendaftaranDropdown[]>([]);
  
  const [formData, setFormData] = useState({
    pendaftaranId: "",
    issuedAt: new Date().toISOString().split("T")[0],
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

useEffect(() => {
    const fetchPendaftaran = async () => {
      try {
        const res = await fetch("/api/pendaftaran", { cache: "no-store" });
        if (res.ok) {
          const responseData = await res.json();
          
          // 1. Siapkan variabel penampung array
          let dataArray: PendaftaranDropdown[] = [];

          // 2. Cek bentuk datanya
          if (Array.isArray(responseData)) {
            // Jika API langsung me-return array: [...]
            dataArray = responseData;
          } else if (responseData && Array.isArray(responseData.data)) {
            // Jika API me-return object dengan property data: { data: [...] }
            dataArray = responseData.data;
          } else {
            // Log ke console untuk melihat bentuk asli datanya jika masih error
            console.error("Format data dari API tidak sesuai (bukan array):", responseData);
            return; 
          }

          // 3. Lakukan filter dengan aman
          const lulusOnly = dataArray.filter((item: PendaftaranDropdown) => item.status === 'LULUS');
          setPendaftaranList(lulusOnly);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar pendaftaran", error);
      }
    };
    fetchPendaftaran();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: [] });
    }
    if (notification?.type === "error") {
      setNotification(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    
    const validation = sertifikatSchema.safeParse(formData);
    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      setNotification({ type: "error", message: "Mohon lengkapi form dengan benar." });
      return;
    }

    setIsLoading(true);
    setFormErrors({});

    try {
      const response = await fetch("/api/sertifikat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // certificateUrl tidak dikirim lagi, karena diurus oleh server
        body: JSON.stringify(formData), 
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal menyimpan data ke server");
      }

      setNotification({ type: "success", message: "Sertifikat berhasil di-generate dan disimpan!" });
      
      setTimeout(() => {
        router.push("/dashboard/admin/sertifikat");
        router.refresh(); 
      }, 1500);

    } catch (error: any) {
      setNotification({ type: "error", message: error.message });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Sertifikat</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Buat sertifikat otomatis berdasarkan kelulusan.</p>
        </div>
        <button onClick={() => router.push("/dashboard/admin/sertifikat")} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
        
        {notification && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
              Peserta Lulus <span className="text-red-500">*</span>
            </label>
            <select
              name="pendaftaranId"
              value={formData.pendaftaranId}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors.pendaftaranId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Pilih Peserta --</option>
              {pendaftaranList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.user?.name || item.user?.email || "Tanpa Nama"}
                </option>
              ))}
            </select>
            {formErrors.pendaftaranId && <p className="text-red-500 text-xs mt-1">{formErrors.pendaftaranId[0]}</p>}
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pelatihan</label>
            <select disabled value={formData.pendaftaranId} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed">
              <option value="">-- Otomatis Terisi --</option>
              {pendaftaranList.map((item) => (
                <option key={item.id} value={item.id}>{item.jadwal?.pelatihan?.title || "Tanpa Pelatihan"}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select disabled value={formData.pendaftaranId} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed">
              <option value="">-- Otomatis --</option>
              {pendaftaranList.map((item) => (
                <option key={item.id} value={item.id}>{item.status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input URL Certificate dihapus dari sini */}

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
            Tanggal Terbit <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="issuedAt"
            value={formData.issuedAt}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors.issuedAt ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-2">
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</> : <><Save className="w-4 h-4" /> Generate & Simpan</>}
          </button>
        </div>
      </form>
    </div>
  );
}