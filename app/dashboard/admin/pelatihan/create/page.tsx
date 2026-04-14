import { PelatihanForm } from "@/components/pelatihan/form";

export default function CreatePelatihanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Tambah Pelatihan Baru
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Masukkan detail pelatihan yang akan ditambahkan ke sistem.
        </p>
      </div>

      <PelatihanForm />
    </div>
  );
}
