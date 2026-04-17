"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";

const sertifikatSchema = z.object({
  namaPeserta: z.string().min(1, "Nama peserta wajib diisi"),
  status: z.string().min(1, "Status wajib diisi"),
  issuedAt: z.string().min(1, "Tanggal terbit wajib diisi"),
});

export default function EditSertifikatPage() {
  const router = useRouter();
  const params = useParams();
  const sertifikatId = params.id as string;

  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    namaPeserta: "",
    status: "",
    issuedAt: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/sertifikat/${sertifikatId}`);
        if (res.ok) {
          const detail = await res.json();
          setFormData({
            namaPeserta: detail.pendaftaran?.user?.name || "",
            status: detail.pendaftaran?.status || "LULUS",
            issuedAt: new Date(detail.issuedAt).toISOString().split("T")[0],
          });
        } else {
          throw new Error("Sertifikat tidak ditemukan");
        }
      } catch {
        setNotification({ type: "error", message: "Gagal memuat data dari server." });
      } finally {
        setIsFetchingData(false);
      }
    };

    if (sertifikatId) fetchDetail();
  }, [sertifikatId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: [] });
    if (notification?.type === "error") setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    
    const validation = sertifikatSchema.safeParse(formData);
    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      setNotification({ type: "error", message: "Mohon lengkapi form dengan benar sebelum menyimpan." });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sertifikat/${sertifikatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal mengubah data");
      }

      setNotification({ type: "success", message: "Data berhasil diperbarui dan Sertifikat di-generate ulang!" });
      setTimeout(() => {
        router.push("/dashboard/admin/sertifikat");
        router.refresh(); 
      }, 1500);

    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah data";
      setNotification({ type: "error", message });
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return <div className="flex justify-center items-center h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit & Re-Generate Sertifikat</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ubah nama, status kelulusan, atau tanggal terbit dengan mudah.</p>
        </div>
        <button onClick={() => router.push("/dashboard/admin/sertifikat")} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Batal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
        
        {notification && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          
          {/* Input 1: NAMA BISA DIUBAH SESUKA HATI */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
              Nama Peserta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaPeserta"
              value={formData.namaPeserta}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors.namaPeserta ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Masukkan nama untuk sertifikat"
            />
            {formErrors.namaPeserta && <p className="text-red-500 text-xs mt-1">{formErrors.namaPeserta[0]}</p>}
          </div>

          {/* Input 2: STATUS BISA DIUBAH */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
              Status Pendaftaran <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="LULUS">LULUS</option>
              <option value="PROSES">PROSES</option>
              <option value="MENUNGGU">MENUNGGU</option>
              <option value="GAGAL">GAGAL</option>
            </select>
            {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status[0]}</p>}
          </div>
        </div>

        {/* Input 3: TANGGAL TERBIT */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
            Tanggal Terbit <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="issuedAt"
            value={formData.issuedAt}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors.issuedAt ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
          />
          {formErrors.issuedAt && <p className="text-red-500 text-xs mt-1">{formErrors.issuedAt[0]}</p>}
        </div>

        <div className="pt-4 flex justify-end border-t border-gray-200 dark:border-gray-800 mt-2">
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><Save className="w-4 h-4" /> Simpan & Generate Ulang</>}
          </button>
        </div>
      </form>
    </div>
  );
}
