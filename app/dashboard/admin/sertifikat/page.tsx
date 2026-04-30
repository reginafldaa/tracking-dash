"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, Calendar, Download, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

// --- KUMPULAN INTERFACE TYPESCRIPT ---
interface User {
  id: string;
  name: string | null;
  email: string;
}

type StatusPendaftaran = "MENUNGGU" | "PROSES" | "LULUS" | "GAGAL";

interface Pelatihan {
  id: string;
  name: string;
}

interface Jadwal {
  id: string;
  date: string;
  location?: string;
  pelatihan?: Pelatihan;
}

interface Pendaftaran {
  id: string;
  userId: string;
  status: StatusPendaftaran;
  user?: User;
  jadwal?: Jadwal;
}

interface Sertifikat {
  id: string;
  pendaftaranId: string;
  certificateUrl: string;
  issuedAt: string;
  createdAt: string;
  pendaftaran?: Pendaftaran;
}

// Fungsi penentu warna badge status (Bisa disesuaikan warnanya)
const getStatusColor = (status?: string) => {
  switch (status) {
    case "LULUS":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "PROSES":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "MENUNGGU":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    case "GAGAL":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export default function AdminSertifikatPage() {
  const router = useRouter();
  const [sertifikatList, setSertifikatList] = useState<Sertifikat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk menggantikan SweetAlert
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sertifikat", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setSertifikatList(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification({ type: "error", message: "Gagal mengambil data dari server." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fitur pencarian
  const filteredData = sertifikatList.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const userName = item.pendaftaran?.user?.name?.toLowerCase() || "";
    const userEmail = item.pendaftaran?.user?.email?.toLowerCase() || "";
    const pelatihanName = item.pendaftaran?.jadwal?.pelatihan?.name?.toLowerCase() || "";

    return userName.includes(searchLower) || userEmail.includes(searchLower) || pelatihanName.includes(searchLower) || item.certificateUrl.toLowerCase().includes(searchLower);
  });

  const handleDelete = async (id: string) => {
    // Menggunakan window.confirm bawaan browser agar tidak butuh library eksternal
    const isConfirmed = window.confirm("Hapus Sertifikat? Data yang dihapus tidak dapat dikembalikan!");
    if (!isConfirmed) return;

    setNotification(null); // Reset notifikasi
    try {
      const response = await fetch(`/api/sertifikat/${id}`, { method: "DELETE" });
      if (response.ok) {
        setSertifikatList((prev) => prev.filter((item) => item.id !== id));
        setNotification({ type: "success", message: "Sertifikat berhasil dihapus secara permanen." });

        // Hilangkan notifikasi sukses setelah 3 detik
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error("Gagal menghapus data dari database.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus data.";
      setNotification({ type: "error", message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kelola Sertifikat</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Mengubah dan hapus data sertifikat untuk peserta.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 min-h-[500px] transition-colors">
        {/* Area Notifikasi */}
        {notification && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${notification.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800"}`}
          >
            {notification.message}
          </div>
        )}

        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Cari Peserta atau Pelatihan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* <button 
          onClick={() => router.push('/dashboard/admin/sertifikat/create')}
          className="w-full sm:w-auto bg-[#1a56db] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Sertifikat
        </button> */}
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Nama Peserta</th>
                <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Pelatihan & Jadwal</th>
                <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Tanggal Terbit</th>
                <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">Status</th>
                <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Memuat data sertifikat...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Tidak ada data sertifikat ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Kolom Nama User */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.pendaftaran?.user?.name || "Nama tidak tersedia"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{item.pendaftaran?.user?.email || "Email tidak tersedia"}</span>
                      </div>
                    </td>

                    {/* Kolom Pelatihan & Jadwal Baru */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.pendaftaran?.jadwal?.pelatihan?.name || "Pelatihan tidak diketahui"}</span>
                        {item.pendaftaran?.jadwal?.date && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.pendaftaran.jadwal.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kolom Tanggal Terbit Sertifikat */}
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(item.issuedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>

                    {/* Kolom Status Pendaftaran */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(item.pendaftaran?.status)}`}>{item.pendaftaran?.status || "UNKNOWN"}</span>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <a href={item.certificateUrl} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Lihat Sertifikat">
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => router.push(`/dashboard/admin/sertifikat/${item.id}/edit`)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                          title="Edit Data"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Hapus Data">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
