"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";

const sertifikatSchema = z.object({
  pendaftaranId: z.string().min(1, "Silakan pilih data peserta (Pendaftaran)"),
  certificateUrl: z.string().url("Format URL tidak valid (harus diawali http/https)").min(1, "URL wajib diisi"),
  issuedAt: z.string().min(1, "Tanggal terbit wajib diisi"),
});

interface PendaftaranDropdown {
  id: string;
  status: string;
  user?: { name: string | null; email: string };
  jadwal?: { pelatihan?: { title: string } };
}

export default function EditSertifikatPage() {
  const router = useRouter();
  const params = useParams();
  const sertifikatId = params.id as string;

  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendaftaranList, setPendaftaranList] = useState<PendaftaranDropdown[]>([]);
  
  const [formData, setFormData] = useState({
    pendaftaranId: "",
    certificateUrl: "",
    issuedAt: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resPendaftaran, resSertifikat] = await Promise.all([
          fetch("/api/pendaftaran", { cache: "no-store" }),
          fetch(`/api/sertifikat/${sertifikatId}`)
        ]);

        if (resPendaftaran.ok) {
          const list = await resPendaftaran.json();
          setPendaftaranList(list);
        }

        if (resSertifikat.ok) {
          const detail = await resSertifikat.json();
          setFormData({
            pendaftaranId: detail.pendaftaranId,
            certificateUrl: detail.certificateUrl,
            issuedAt: new Date(detail.issuedAt).toISOString().split("T")[0],
          });
        }
      } catch (error) {
        setNotification({ type: "error", message: "Gagal memuat data dari server." });
      } finally {
        setIsFetchingData(false);
      }
    };

    if (sertifikatId) fetchAllData();
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

      setNotification({ type: "success", message: "Data sertifikat berhasil diperbarui!" });
      setTimeout(() => {
        router.push("/dashboard/admin/sertifikat");
        router.refresh(); 
      }, 1500);

    } catch (error: any) {
      setNotification({ type: "error", message: error.message });
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Sertifikat</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perbarui detail data sertifikat ini.</p>
        </div>
        <button onClick={() => router.push("/dashboard/admin/sertifikat")} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Batal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
        
        {notification && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          
          {/* Dropdown 1: Nama */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
              Nama Peserta <span className="text-red-500">*</span>
            </label>
            <select
              name="pendaftaranId"
              value={formData.pendaftaranId}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors.pendaftaranId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
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

          {/* Dropdown 2: Pelatihan (Disabled) */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Pelatihan</label>
            <select disabled value={formData.pendaftaranId} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed">
              <option value="">-- Otomatis Terisi --</option>
              {pendaftaranList.map((item) => (
                <option key={item.id} value={item.id}>{item.jadwal?.pelatihan?.title || "Tanpa Pelatihan"}</option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Status (Disabled) */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Status</label>
            <select disabled value={formData.pendaftaranId} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed">
              <option value="">-- Otomatis Terisi --</option>
              {pendaftaranList.map((item) => (
                <option key={item.id} value={item.id}>{item.status}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">URL Dokumen Sertifikat <span className="text-red-500">*</span></label>
          <input
            type="url"
            name="certificateUrl"
            value={formData.certificateUrl}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors.certificateUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
          />
          {formErrors.certificateUrl && <p className="text-red-500 text-xs mt-1">{formErrors.certificateUrl[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Tanggal Terbit <span className="text-red-500">*</span></label>
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
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Perbarui Data</>}
          </button>
        </div>
      </form>
    </div>
  );
}