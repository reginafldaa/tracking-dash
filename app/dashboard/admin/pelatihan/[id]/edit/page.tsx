import { PelatihanForm } from "@/components/pelatihan/form";
import { getPelatihanById } from "@/server/pelatihan";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPelatihanPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getPelatihanById(id);

  if (!data) {
    notFound();
  }

  // Map the database model to the form input format
  const initialData = {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    image: data.image || undefined,
    duration: data.duration,
    status: data.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Edit Pelatihan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Perbarui detail pelatihan ini dalam sistem.
        </p>
      </div>

      <PelatihanForm initialData={initialData} isEdit />
    </div>
  );
}
