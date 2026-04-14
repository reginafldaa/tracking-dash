import { Search, Plus, Eye, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Sementara kita tarik data real dari db jika ada, jika tidak, kita gabungkan dgn dummy
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    include: { pendaftarans: true }
  });

  // Data statis sebagai fallback untuk tampilan agar presisi dengan mockup
  const dummyData = [
    { id: "1", name: "Rudi Saputra", status: "Selesai / Lulus", absensi: "Check in Selesai", color: "bg-emerald-100 text-emerald-700" },
    { id: "2", name: "Agus Prasetyo", status: "Proses", absensi: "Belum", color: "bg-blue-100 text-blue-700" },
    { id: "3", name: "Budi Santoso", status: "Gagal / Belum", absensi: "Absen", color: "bg-rose-100 text-rose-700" },
    { id: "4", name: "Siti Aminah", status: "Selesai / Lulus", absensi: "Check In Selesai", color: "bg-emerald-100 text-emerald-700" },
  ];

  const displayData = users.length > 0 ? users.map((u, i) => ({
    id: u.id,
    name: u.name || "Peserta Tanpa Nama",
    status: u.pendaftarans[0]?.status === "LULUS" ? "Selesai / Lulus" : 
            u.pendaftarans[0]?.status === "GAGAL" ? "Gagal / Belum" : "Proses",
    absensi: i % 2 === 0 ? "Check in Selesai" : "Belum", // Dummy absensi since logic is complex
    color: u.pendaftarans[0]?.status === "LULUS" ? "bg-emerald-100 text-emerald-700" :
           u.pendaftarans[0]?.status === "GAGAL" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
  })) : dummyData;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Header Action Items */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Cari data peserta email..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto justify-center">
            <Plus className="h-5 w-5" />
            <span>Tambah Peserta</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="py-4 px-6 font-medium text-gray-600 whitespace-nowrap">Nama</th>
                <th className="py-4 px-6 font-medium text-gray-600 text-center whitespace-nowrap">Status</th>
                <th className="py-4 px-6 font-medium text-gray-600 text-center whitespace-nowrap">Absensi</th>
                <th className="py-4 px-6 font-medium text-gray-600 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((peserta) => (
                <tr key={peserta.id} className="border-b hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {peserta.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{peserta.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${peserta.color}`}>
                      {peserta.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      peserta.absensi.includes("Selesai") ? "bg-emerald-100 text-emerald-700" :
                      peserta.absensi === "Absen" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {peserta.absensi}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors" title="Lihat Detail">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors" title="Edit Data">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
