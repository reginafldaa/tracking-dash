"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { pendaftaranSchema, type PendaftaranInput } from "@/server/pendaftaran.schema";
import { createPendaftaran, getPelatihanList } from "@/server/pendaftaran";
import { useEffect } from "react";

export function PendaftaranForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pelatihans, setPelatihans] = useState<Array<{ id: string; name: string; tanggal: Date }>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<PendaftaranInput>({
    resolver: zodResolver(pendaftaranSchema),
    mode: "onChange",
    defaultValues: {
      metode: "OFFLINE",
    },
  });

  useEffect(() => {
    const loadPelatihans = async () => {
      const result = await getPelatihanList();
      if (result.success) {
        setPelatihans(result.data);
      }
    };
    loadPelatihans();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format file harus PDF, JPG, atau PNG");
      return;
    }

    // For demo: convert to base64 URL (replace with actual upload service)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedFiles((prev) => ({ ...prev, [fieldName]: dataUrl }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<PendaftaranInput> = async (formData) => {
    console.log("[FORM] Button ditekan, form validation:", { isValid, isDirty, errors });
    console.log("[FORM] Form data yang valid:", formData);
    
    setLoading(true);
    setError(null);

    try {
      // Check if all required files are uploaded
      const requiredFiles = ["fotoKtp", "ijazah", "pasFoto", "buktiTransfer"];
      const missingFiles = requiredFiles.filter((f) => !uploadedFiles[f]);

      console.log("[FORM] File upload status:", { uploadedFiles, missingFiles });

      if (missingFiles.length > 0) {
        const msg = `File berikut belum diupload: ${missingFiles.join(", ")}`;
        console.log("[FORM] ✗ File tidak lengkap:", msg);
        setError(msg);
        setLoading(false);
        return;
      }
      
      console.log("[FORM] ✓ Semua file sudah diupload");

      // Prepare submit data dengan URLs
      const submitData = {
        ...formData,
        fotoKtp: uploadedFiles.fotoKtp,
        ijazah: uploadedFiles.ijazah,
        pasFoto: uploadedFiles.pasFoto,
        suratKerja: uploadedFiles.suratKerja || undefined,
        buktiTransfer: uploadedFiles.buktiTransfer,
      };

      console.log("[FORM] Mengirim data pendaftaran:", {
        namaLengkap: submitData.namaLengkap,
        email: submitData.email,
        pelatihanId: submitData.pelatihanId,
      });

      const result = await createPendaftaran(submitData);

      console.log("[FORM] Response dari server:", { success: result.success, error: result.error });

      if (result.success) {
        router.push(`/dashboard/user/pendaftaran/success`);
      } else {
        setError(result.error || "Gagal mendaftar");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      console.error("[FORM] Client error:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const metode = watch("metode");

  return (
    <Card className="max-w-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800">
        <CardTitle className="text-2xl text-gray-900 dark:text-white">
          Formulir Pendaftaran Pelatihan
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Lengkapi semua field dan upload dokumen yang diperlukan
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-red-700 dark:text-red-200 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Data Pribadi Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Pribadi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="John Doe"
                  className={`bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 dark:text-white ${
                    errors.namaLengkap ? "border-red-500" : ""
                  }`}
                  {...register("namaLengkap")}
                />
                {errors.namaLengkap && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.namaLengkap.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className={`bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 dark:text-white ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* No Telepon */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  No. Telepon <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="08123456789"
                  className={`bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 dark:text-white ${
                    errors.noTelp ? "border-red-500" : ""
                  }`}
                  {...register("noTelp")}
                />
                {errors.noTelp && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.noTelp.message}</p>
                )}
              </div>

              {/* Pekerjaan */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Pekerjaan <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Software Engineer"
                  className={`bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 dark:text-white ${
                    errors.pekerjaan ? "border-red-500" : ""
                  }`}
                  {...register("pekerjaan")}
                />
                {errors.pekerjaan && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.pekerjaan.message}</p>
                )}
              </div>

              {/* Instansi */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Instansi <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="PT Example Indonesia"
                  className={`bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 dark:text-white ${
                    errors.instansi ? "border-red-500" : ""
                  }`}
                  {...register("instansi")}
                />
                {errors.instansi && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.instansi.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pendaftaran Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informasi Pendaftaran</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pelatihan */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Pelatihan <span className="text-red-500">*</span>
                </Label>
                <select
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-md dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.pelatihanId ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                  }`}
                  {...register("pelatihanId")}
                >
                  <option value="">-- Pilih Pelatihan --</option>
                  {pelatihans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({new Date(p.tanggal).toLocaleDateString("id-ID")})
                    </option>
                  ))}
                </select>
                {errors.pelatihanId && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.pelatihanId.message}</p>
                )}
              </div>

              {/* Metode */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Metode <span className="text-red-500">*</span>
                </Label>
                <select
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-md dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.metode ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                  }`}
                  {...register("metode")}
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
                {errors.metode && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.metode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Dokumen Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Dokumen</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Format: PDF, JPG, PNG | Ukuran max: 5MB
            </p>

            <div className="grid grid-cols-1 gap-4">
              {[
                { field: "fotoKtp", label: "Foto KTP", required: true },
                { field: "ijazah", label: "Ijazah", required: true },
                { field: "pasFoto", label: "Pas Foto", required: true },
                { field: "suratKerja", label: "Surat Kerja (Opsional)", required: false },
                { field: "buktiTransfer", label: "Bukti Transfer", required: true },
              ].map(({ field, label, required }) => (
                <FileUploadField
                  key={field}
                  label={label}
                  fieldName={field as keyof typeof uploadedFiles}
                  isUploaded={!!uploadedFiles[field]}
                  onUpload={(e) => handleFileUpload(e, field)}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 dark:text-gray-300 dark:border-gray-700"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface FileUploadFieldProps {
  label: string;
  fieldName: string;
  isUploaded: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUploadField({ label, fieldName, isUploaded, onUpload }: FileUploadFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700 dark:text-gray-300">{label}</Label>
      {isUploaded ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-900 dark:text-green-200">File berhasil diupload</p>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition">
          <p className="text-sm text-gray-600 dark:text-gray-400">Klik untuk upload</p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onUpload}
          />
        </label>
      )}
    </div>
  );
}
