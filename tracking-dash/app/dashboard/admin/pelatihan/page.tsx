import { getPelatihans } from "@/server/actions/pelatihan"
import { PelatihanClient } from "./client"
import { AlertCircle } from "lucide-react"

export default async function PelatihanPage() {
  const result = await getPelatihans()

  if (!result.success) {
    return (
      <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-md">
        <AlertCircle className="w-5 h-5" />
        <p>Gagal memuat data: {result.error}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-0 md:flex">
      <PelatihanClient data={result.data || []} />
    </div>
  )
}
