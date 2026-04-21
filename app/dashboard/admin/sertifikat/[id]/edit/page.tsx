"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
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
    status: "LULUS",
    issuedAt: "",
  });

  useEffect(() => {
    const fetchSertifikat = async () => {
      try {
        const res = await fetch(`/api/sertifikat/${sertifikatId}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            namaPeserta: data.pendaftaran?.namaLengkap || data.pendaftaran?.user?.name || "",
            status: data.pendaftaran?.status || "LULUS",
            issuedAt: data.issuedAt ? new Date(data.issuedAt).toISOString().split('T')[0] : "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchSertifikat();
  }, [sertifikatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validasi ringan dengan Zod
      sertifikatSchema.parse(formData);
      
      const res = await fetch(`/api/sertifikat/${sertifikatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard/admin/sertifikat");
      } else {
        alert("Gagal mengupdate sertifikat.");
      }
    } catch (error) {
      console.error(error);
      alert("Pastikan semua form terisi dengan benar.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Sertifikat</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Peserta</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.namaPeserta}
            onChange={(e) => setFormData({ ...formData, namaPeserta: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status Pendaftaran</label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="LULUS">LULUS (Generate/Update PDF)</option>
            <option value="TIDAK LULUS">TIDAK LULUS (Cabut Sertifikat)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Terbit</label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.issuedAt}
            onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1a56db] hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? "Menyimpan & Re-generate PDF..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}