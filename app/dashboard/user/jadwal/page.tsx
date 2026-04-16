'use client';

import { useEffect, useState } from 'react';


type Jadwal = {
  id: string;
  date: string;
  location: string;
  metode: string;
  status: string;
  pelatihanId: string;
};

type Pelatihan = {
  id: string;
  name: string;
};

export default function JadwalUserPage() {
  const [filter, setFilter] = useState('semua');
  const [filterMetode, setFilterMetode] = useState('semua');
const [filterPelatihan, setFilterPelatihan] = useState('semua');
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<Jadwal[]>([]);
  const [pelatihanList, setPelatihanList] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch('/api/jadwal');
    const json = await res.json();

    if (json.success) {
      setData(json.data);
    }
  };

  const fetchPelatihan = async () => {
    const res = await fetch('/api/pelatihan');
    const json = await res.json();

    if (json.success) {
      setPelatihanList(json.data);
    }
  };

  useEffect(() => {
    Promise.all([fetchData(), fetchPelatihan()]).then(() =>
      setLoading(false)
    );
  }, []);
  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => clearTimeout(timer);
}, [search]);

  const getPelatihanName = (id: string) => {
    return pelatihanList.find((p) => p.id === id)?.name || '-';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'on going':
        return 'bg-blue-100 text-blue-700';
      case 'reschedule':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading jadwal...</p>;
  }
const filteredData = data.filter((item) => {
  const matchMetode =
    filterMetode === 'semua' || item.metode === filterMetode;

  const matchPelatihan =
    filterPelatihan === 'semua' ||
    item.pelatihanId === filterPelatihan;

  const namaPelatihan = pelatihanList.find(
    (p) => p.id === item.pelatihanId
  )?.name.toLowerCase() || '';

  const matchSearch =
    namaPelatihan.includes(debouncedSearch.toLowerCase());

  return matchMetode && matchPelatihan && matchSearch;
});
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Jadwal Pelatihan</h1>
     <div className="flex flex-wrap gap-3 mb-6 items-center">

        <input
  type="text"
  placeholder="🔍 Cari pelatihan..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full mb-4 border border-black rounded-xl px-4 py-2 text-sm 
             focus:outline-none focus:ring-2 focus:ring-blue-400"
/>
  
  {/* FILTER METODE */}
  <div className="flex gap-2">
    {['semua', 'online', 'offline'].map((f) => (
      <button
        key={f}
        onClick={() => setFilterMetode(f)}
        className={`px-4 py-2 rounded-full text-sm capitalize transition
          ${
            filterMetode === f
              ? 'bg-blue-500 text-white shadow'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
      >
        {f}
      </button>
    ))}
  </div>

  {/* FILTER PELATIHAN */}
<div className="relative flex-1">
  <select
    className="
      w-full h-10 px-3 pr-10
      border border-gray-300 rounded-xl
      text-sm bg-white
      appearance-none
      focus:outline-none focus:ring-2 focus:ring-blue-500
    "
  >
    <option value="">Pilih Pelatihan</option>
    {pelatihanList.map((p) => (
      <option key={p.id} value={p.id}>
        {p.name}
      </option>
    ))}
  </select>

  {/* ICON */}
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
    ▼
  </span>
</div>

</div>

      {filteredData.length === 0 ? (
  <p className="text-center text-gray-400">
    🚫 Tidak ada jadwal yang tersedia
  </p>
) : (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredData.map((item) => (
            <div
  key={item.id}
  className="group border border-gray-200 rounded-2xl p-5 bg-white 
             shadow-sm hover:shadow-xl hover:-translate-y-1 
             transition-all duration-300"
>
              {/* Nama Pelatihan */}
              <h2 className="text-lg font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition">
  {getPelatihanName(item.pelatihanId)}
</h2>

              {/* Tanggal */}
              <p className="text-sm text-gray-500 mb-2">
                📅 {formatDate(item.date)}
              </p>

              {/* Metode */}
              <p>
  {item.metode === 'online' ? '💻 Online' : '🏢 Offline'}
</p>

              {/* Lokasi */}
              <p className="text-sm mb-3">
                📍 {item.metode === 'offline' ? item.location : 'Online'}
              </p>

              {/* Status */}
              <span
                className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status}
              </span>

              {/* Button */}
              <button
  disabled={item.status === 'done'}
  onClick={() => alert('Daftar ke ' + item.id)}
  className={`mt-5 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300
    ${
      item.status === 'done'
        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 hover:shadow-lg'
    }`}
>
  {item.status === 'done' ? 'Selesai' : 'Daftar Sekarang'}
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}