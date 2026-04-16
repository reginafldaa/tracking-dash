'use client';

import { useEffect, useState } from 'react';

type Jadwal = {
  id: string;
  date: string;
  location: string;
  pelatihanId: string;
  metode: string;   
  status: string;
};

export default function AdminJadwalPage() {
  const [data, setData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pelatihanList, setPelatihanList] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [selectedId, setSelectedId] = useState<string>('');

  const [form, setForm] = useState({
    id: '',
    date: '',
    location: '',
    pelatihanId: '',
    metode: '', 
    status: '',
  });

  // FETCH 
  const fetchData = async () => {
    const res = await fetch('/api/jadwal');
    const json = await res.json();

    if (json.success) {
      setData(json.data);
    }
    setLoading(false);
  };
  const fetchPelatihan = async () => {
  try {
    const res = await fetch('/api/pelatihan');
    const json = await res.json();
    
    console.log('PELATHAN:', json);

    if (json.success) {
      setPelatihanList(json.data);
    }
  } catch (error) {
    console.error('FETCH PELATIHAN ERROR:', error);
  }
};
  useEffect(() => {
  fetchData();
  fetchPelatihan();
}, []);

  
  const handleChange = (e: any) => {
    console.log(e.target.name, e.target.value);
  setForm({
    ...form,
    [e.target.name]: e.target.value.toString(),
  });
};

  // TAMBAH 
  const handleAdd = async () => {
  if (!form.date) return alert('Tanggal kosong');
  if (!form.pelatihanId) return alert('Pelatihan belum dipilih');
  if (!form.metode) return alert('Metode belum dipilih');
  if (!form.status) return alert('Status belum dipilih');

  if (form.metode === 'offline' && !form.location) {
    return alert('Lokasi wajib diisi untuk offline');
  }

  const payload = {
    ...form,
    date: new Date(form.date).toISOString(),
  };

  const res = await fetch('/api/jadwal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  console.log('ADD RESULT:', result);

  if (!result.success) {
    alert(result.message);
    return;
  }

  setShowModal(false);
  fetchData();
};

  // EDIT 
  const handleEdit = (item: Jadwal) => {
  console.log('EDIT ITEM:', item);

  setIsEdit(true);
  setShowModal(true);

  setForm({
    id: item.id,
    date: item.date?.split('T')[0] || '',
    location: item.location || '',
    pelatihanId: item.pelatihanId || '',
    metode: item.metode || '',
    status: item.status || '',
  });
};

  const handleUpdate = async () => {
  console.log('FORM ID:', form.id);

  if (!form.id) {
    alert('ID kosong');
    return;
  }

    if (!form.date || !form.pelatihanId) {
  alert('Tanggal & pelatihan wajib');
  return;
}

if (form.metode === 'offline' && !form.location) {
  alert('Lokasi wajib untuk offline');
  return;
}
  const payload = {
    ...form,
    date: new Date(form.date).toISOString(),
  };
  console.log('UPDATE ID:', form.id);
  const res = await fetch(`/api/jadwal/${form.id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});
console.log('CLICK UPDATE - selectedId:', selectedId);
  let result;

try {
  result = await res.json();
} catch (err) {
  console.error('JSON ERROR:', err);
  alert('Response bukan JSON / API error');
  return;
}
  console.log('UPDATE RESULT:', result);

  if (!result.success) {
    alert(result.message);
    return;
  }

  setShowModal(false);
  setIsEdit(false);
  fetchData();
};

  // DELETE 
  const handleDelete = async (id: string) => {
  const confirmDelete = confirm('Yakin mau hapus?');
  if (!confirmDelete) return;

  const res = await fetch(`/api/jadwal/${id}`, {
    method: 'DELETE',
  });

  const result = await res.json();
  console.log('DELETE RESULT:', result);

  if (!result.success) {
    alert(result.message);
    return;
  }

  fetchData();
};

  
  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
  <h2 className="text-xl font-bold">Data Jadwal</h2>

  <button
    onClick={() => {
      setShowModal(true);
      setIsEdit(false);
      setForm({
        id: '',
        date: '',
        location: '',
        pelatihanId: '',
        metode: '',
        status: '',
      });
    }}
    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
  >
    + Tambah Jadwal
  </button>
</div>

    <div className="overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-gray-50 text-gray-600">
      <tr>
        <th className="p-3 text-left">Tanggal</th>
        <th className="p-3 text-left">Pelatihan</th>
        <th className="p-3 text-left">Metode Pembelajaran</th>
        <th className="p-3 text-center">Lokasi</th>
        <th className="p-3 text-center">Status</th>
        <th className="p-3 text-center">Aksi</th>
      </tr>
    </thead>

    <tbody>
      {data.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center p-4 text-gray-400">
            Belum ada jadwal
          </td>
        </tr>
      ) : (
        data.map((item) => {
          const pelatihan = pelatihanList.find(
            (p: any) => p.id === item.pelatihanId
          );

          return (
            <tr
  key={item.id}
  className="border-t hover:bg-gray-50 transition"
>
  {/* TANGGAL */}
  <td className="p-3">
    {new Date(item.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}
  </td>

  {/* PELATIHAN */}
  <td className="p-3">
    {pelatihan?.name || 'Tidak ada'}
  </td>

  {/* METODE */}
  <td className="p-3">
    {item.metode || '-'}
  </td>

  {/* LOKASI */}
  <td className="p-3 text-center">
    {item.metode === 'offline' ? item.location : '-'}
  </td>

  {/* STATUS */}
  <td className="p-3 text-center">
    <span className="bg-gray-200 px-2 py-1 rounded text-xs">
      {item.status || '-'}
    </span>
  </td>

  {/* AKSI */}
  <td className="p-3 text-center">
    <div className="flex justify-center gap-2">
      <button
        onClick={() => handleEdit(item)}
        className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-xs"
      >
        Edit
      </button>

      <button
        onClick={() => handleDelete(item.id)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
      >
        Delete
      </button>
    </div>
  </td>
</tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-bold mb-4">
              {isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}
            </h3>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border p-2 mb-2"
            />

            <input
              type="text"
              name="location"
              placeholder="Lokasi"
              value={form.location}
              onChange={handleChange}
              className="w-full border p-2 mb-2"
            />

           <select
  name="pelatihanId"
  value={form.pelatihanId}
  onChange={handleChange}
  className="w-full border p-2 mb-4"
>
  <option value="">Pilih Pelatihan</option>
  {pelatihanList.map((p: any) => (
   <option key={p.id} value={p.id}>
  {p.name}
</option>
  ))}
</select>

<select
  name="metode"
  value={form.metode}
  onChange={handleChange}
  className="w-full border p-2 mb-2"
>
  <option value="">Pilih Metode</option>
  <option value="online">Online</option>
  <option value="offline">Offline</option>
</select>

<select
  name="status"
  value={form.status}
  onChange={handleChange}
  className="w-full border p-2 mb-2"
>
  <option value="">Pilih Status</option>
  <option value="pending">Pending</option>
  <option value="on going">On Going</option>
  <option value="done">Done</option>
  <option value="reschedule">Reschedule</option>
</select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Batal
              </button>

              <button
                onClick={isEdit ? handleUpdate : handleAdd}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                {isEdit ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}