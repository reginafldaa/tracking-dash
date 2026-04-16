'use client';

import { useEffect, useState } from 'react';

type Pelatihan = {
  name: string;
};

type Jadwal = {
  date: string;
  pelatihan: Pelatihan;
};

type UserData = {
  name: string | null;
  email: string;
};

type Pendaftaran = {
  id: string;
  namaLengkap: string;
  email: string;
  noTelp: string;
  pekerjaan: string;
  instansi: string;
  metode: string;
  status: string;
  documentUrl: string | null;
  createdAt: string;
  jadwal?: Jadwal;
  user?: UserData;
};

export default function AdminPesertaPage() {
  const [data, setData] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPeserta, setSelectedPeserta] = useState<Pendaftaran | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pendaftaran', {
        cache: 'no-store' // Memastikan fetch di frontend tidak di-cache
      });
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/pendaftaran', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const result = await res.json();

      if (result.success) {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
      } else {
        alert('Gagal update status: ' + result.message);
      }
    } catch (error) {
      console.error('Update status error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // FUNGSI BARU: Export Data ke CSV
  const handleExportCSV = () => {
    if (data.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }

    // 1. Buat Header Kolom
    const headers = [
      'ID Pendaftaran', 
      'Nama Lengkap', 
      'Email', 
      'No. Telepon', 
      'Pekerjaan', 
      'Instansi', 
      'Metode', 
      'Jadwal Pelatihan', 
      'Status', 
      'Tanggal Daftar'
    ];

    // 2. Petakan Data ke Baris
    const csvRows = data.map((item) => {
      const nama = item.namaLengkap || item.user?.name || '-';
      const email = item.email || item.user?.email || '-';
      const jadwal = item.jadwal ? `${formatDate(item.jadwal.date)} - ${item.jadwal.pelatihan?.name}` : 'Belum memilih jadwal';
      const tanggalDaftar = new Date(item.createdAt).toLocaleDateString('id-ID');

      // Gunakan kutip dua (") untuk menghindari error jika ada koma (,) di dalam text inputan user
      return [
        `"${item.id}"`,
        `"${nama}"`,
        `"${email}"`,
        `"${item.noTelp || '-'}"`,
        `"${item.pekerjaan || '-'}"`,
        `"${item.instansi || '-'}"`,
        `"${item.metode || '-'}"`,
        `"${jadwal}"`,
        `"${item.status}"`,
        `"${tanggalDaftar}"`
      ].join(',');
    });

    // 3. Gabungkan Header dan Baris
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // 4. Proses Download File
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Data_Peserta_Sertifikasi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Tanggal belum ditentukan';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LULUS': return 'bg-green-100 text-green-700 border-green-300';
      case 'GAGAL': return 'bg-red-100 text-red-700 border-red-300';
      case 'PROSES': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
      
      {/* HEADER dengan tombol Export CSV */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Data Peserta</h2>
        <button 
          onClick={handleExportCSV}
          disabled={data.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download CSV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Belum ada data pendaftaran peserta.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const namaPenampil = item.namaLengkap || item.user?.name || 'Nama Tidak Tersedia';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPeserta(item)}
                className="bg-white border border-gray-200 border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
              >
                <div className="w-full flex-1">
                  <div className="flex justify-between items-start w-full mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{namaPenampil}</h3>
                    
                    <div onClick={(e) => e.stopPropagation()} className="ml-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        disabled={isUpdating}
                        className={`px-3 py-1.5 border rounded-full text-xs font-bold outline-none cursor-pointer appearance-none text-center min-w-[100px] ${getStatusColor(item.status)}`}
                      >
                        <option value="MENUNGGU" className="bg-white text-black">Menunggu</option>
                        <option value="PROSES" className="bg-white text-black">Proses</option>
                        <option value="LULUS" className="bg-white text-black">Lulus</option>
                        <option value="GAGAL" className="bg-white text-black">Gagal</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Jadwal Pelatihan</p>
                      <p className="text-sm font-medium">
                        {formatDate(item.jadwal?.date)} <span className="mx-1 text-gray-300">|</span> 
                        <span className="text-gray-800">{item.jadwal?.pelatihan?.name || 'Belum memilih pelatihan'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail */}
      {selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col cursor-auto" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Detail Pendaftaran</h3>
              <button 
                onClick={() => setSelectedPeserta(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                  <p className="text-base font-medium text-gray-900">{selectedPeserta.namaLengkap || selectedPeserta.user?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-base font-medium text-gray-900">{selectedPeserta.email || selectedPeserta.user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">No. Telepon / WhatsApp</p>
                  <p className="text-base font-medium text-gray-900">{selectedPeserta.noTelp || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pekerjaan</p>
                  <p className="text-base font-medium text-gray-900">{selectedPeserta.pekerjaan || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Instansi</p>
                  <p className="text-base font-medium text-gray-900">{selectedPeserta.instansi || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Metode Pendaftaran</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedPeserta.metode || '-'}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Berkas Dokumen</p>
                {selectedPeserta.documentUrl ? (
                  <a
                    href={selectedPeserta.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    Lihat Dokumen Terlampir
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Tidak ada dokumen yang dilampirkan
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}