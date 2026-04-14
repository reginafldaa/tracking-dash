import { Suspense } from "react";
import { getPelatihans } from "@/server/pelatihan";
import { PelatihanTable } from "@/components/pelatihan/table";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}

export default async function PelatihanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query || "";
  const page = Number(params.page) || 1;
  const limit = 10;

  const { data, total, totalPages } = await getPelatihans(query, page, limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Kelola Pelatihan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Tambah, ubah, dan hapus data pelatihan untuk peserta.
        </p>
      </div>

      <Suspense fallback={<div className="h-48 flex items-center justify-center border rounded-md bg-gray-50 dark:bg-gray-900/20">Loading...</div>}>
        <PelatihanTable 
          data={data} 
          total={total} 
          totalPages={totalPages} 
          currentPage={page} 
        />
      </Suspense>
    </div>
  );
}
