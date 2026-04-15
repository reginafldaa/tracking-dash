"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserAbsensiClient } from "@/components/user-absensi-client"

export default function UserAbsensiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Pengisian Absensi
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Kelola check-in dan check-out untuk pelatihan Anda
        </p>
      </div>

      <UserAbsensiClient />
    </div>
  )
}
