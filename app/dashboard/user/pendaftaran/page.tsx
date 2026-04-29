import { Suspense } from "react";
import { PendaftaranForm } from "@/components/pendaftaran/form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pendaftaran Pelatihan",
  description: "Form pendaftaran peserta pelatihan",
};

export default function PendaftaranPage() {
  return (
    <div className="min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pendaftaran Pelatihan
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Daftar sebagai peserta dan ikuti pelatihan berkualitas
        </p>
      </div>
      <Suspense fallback={<div>Memuat form pendaftaran...</div>}>
        <PendaftaranForm />
      </Suspense>
    </div>
  );
}
