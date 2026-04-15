'use client';

import { useEffect, useState } from 'react';

type Pendaftaran = {
  id: number;
  userId: number;
  jadwalId: number;
  documentUrl: string;
  status: string;
  createdAt: string;
};

export default function AdminPesertaPage() {
  const [data, setData] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pendaftaran');
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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[400px]">
      <h2 className="text-2xl font-semibold mb-4">Data Peserta</h2>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">Belum ada data peserta</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded-md flex justify-between"
            >
              <div>
                <p><strong>User ID:</strong> {item.userId}</p>
                <p><strong>Jadwal ID:</strong> {item.jadwalId}</p>
                <p><strong>Status:</strong> {item.status}</p>
              </div>

              <div>
                {item.documentUrl ? (
                  <a
                    href={item.documentUrl}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                    Lihat Dokumen
                  </a>
                ) : (
                  <span className="text-gray-400">Tidak ada dokumen</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}