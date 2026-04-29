"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { pelatihanSchema, type PelatihanFormInput } from "@/server/pelatihan.schema";
import type { SubmitHandler } from "react-hook-form";
import { createPelatihan, updatePelatihan } from "@/server/pelatihan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface FormProps {
  initialData?: PelatihanFormInput & { id: string };
  isEdit?: boolean;
}

export function PelatihanForm({ initialData, isEdit }: FormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PelatihanFormInput>({
    resolver: zodResolver(pelatihanSchema) as any, 
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      image: initialData?.image ?? "",
      status: initialData?.status ?? true,
    },
  });

  const isStatusActive = watch("status");

  const onSubmit: SubmitHandler<PelatihanFormInput> = async (data) => {
    setLoading(true);
    setError(null);
    
    const result = isEdit && initialData?.id
      ? await updatePelatihan(initialData.id, data)
      : await createPelatihan(data);

    if (result.success) {
      router.push("/dashboard/admin/pelatihan");
      router.refresh();
    } else {
      setError(result.error || "Terjadi kesalahan.");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mt-6 shadow-sm border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Pelatihan <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Contoh: Digital Marketing Dasar"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Jelaskan detail tentang pelatihan ini..."
              rows={4}
              {...register("description")}
            />
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-lg">
            <Switch
              id="status"
              checked={isStatusActive}
              onCheckedChange={(checked) => setValue("status", checked)}
            />
            <Label htmlFor="status" className="font-semibold cursor-pointer">
              {isStatusActive ? "Status Aktif" : "Status Tidak Aktif"}
            </Label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/admin/pelatihan")}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Menyimpan...
                </>
              ) : (
                "Simpan Pelatihan"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
