"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  CheckCircle2,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  getUserRegistrations,
  getUserAbsensiStatus,
  submitCheckIn,
  submitCheckOut,
} from "@/server/actions/absensi"

interface Registration {
  id: string
  status: string
  userId: string
  jadwalId: string
  documentUrl: string | null
  createdAt: Date
  updatedAt: Date
  jadwal: {
    id: string
    date: Date
    location: string | null
    pelatihan: {
      name: string
    }
  }
  absensis: Array<{
    id: string
    checkIn: Date | null
    checkOut: Date | null
  }>
}

interface Absensi {
  id: string
  checkIn: Date | null
  checkOut: Date | null
  pendaftaran: {
    jadwal: {
      pelatihan: {
        name: string
      }
    }
  }
}

export function UserAbsensiClient() {
  const { data: session } = useSession()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [absensiStatus, setAbsensiStatus] = useState<Map<string, Absensi>>(new Map())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) return

      try {
        const [regRes, absenRes] = await Promise.all([
          getUserRegistrations(session.user.id),
          getUserAbsensiStatus(session.user.id),
        ])

        if (regRes.success) {
          setRegistrations(regRes.data)
        }

        if (absenRes.success) {
          const statusMap = new Map()
          absenRes.data.forEach((abs) => {
            statusMap.set(abs.pendaftaran.id, abs)
          })
          setAbsensiStatus(statusMap)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setMessage({ type: "error", text: "Gagal memuat data" })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id])

  const handleCheckIn = async (pendaftaranId: string) => {
    const userId = session?.user?.id
    if (!userId) {
      setMessage({ type: "error", text: "Sesi user tidak ditemukan" })
      return
    }

    setSubmitting(pendaftaranId)
    try {
      const result = await submitCheckIn(pendaftaranId)
      if (result.success) {
        setMessage({ type: "success", text: "Check-in berhasil!" })
        // Refresh data
        const absenRes = await getUserAbsensiStatus(userId)
        if (absenRes.success) {
          const statusMap = new Map()
          absenRes.data.forEach((abs) => {
            statusMap.set(abs.pendaftaran.id, abs)
          })
          setAbsensiStatus(statusMap)
        }
      } else {
        setMessage({ type: "error", text: result.error || "Gagal melakukan check-in" })
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" })
    } finally {
      setSubmitting(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleCheckOut = async (pendaftaranId: string) => {
    const userId = session?.user?.id
    if (!userId) {
      setMessage({ type: "error", text: "Sesi user tidak ditemukan" })
      return
    }

    setSubmitting(pendaftaranId)
    try {
      const result = await submitCheckOut(pendaftaranId)
      if (result.success) {
        setMessage({ type: "success", text: "Check-out berhasil!" })
        // Refresh data
        const absenRes = await getUserAbsensiStatus(userId)
        if (absenRes.success) {
          const statusMap = new Map()
          absenRes.data.forEach((abs) => {
            statusMap.set(abs.pendaftaran.id, abs)
          })
          setAbsensiStatus(statusMap)
        }
      } else {
        setMessage({ type: "error", text: result.error || "Gagal melakukan check-out" })
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" })
    } finally {
      setSubmitting(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const getStatusColor = (registration: Registration) => {
    const absensi = absensiStatus.get(registration.id)
    if (absensi?.checkIn && absensi?.checkOut) {
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    } else if (absensi?.checkIn && !absensi?.checkOut) {
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
    }
    return "bg-slate-50 dark:bg-slate-800"
  }

  const getStatusBadge = (registration: Registration) => {
    const absensi = absensiStatus.get(registration.id)
    if (absensi?.checkIn && absensi?.checkOut) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4" />
          Hadir
        </span>
      )
    } else if (absensi?.checkIn && !absensi?.checkOut) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200">
          <Clock className="h-4 w-4" />
          Sedang Hadir
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
        <AlertCircle className="h-4 w-4" />
        Belum Absen
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Anda belum mendaftar pada pelatihan manapun
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Daftar Pelatihan & Absensi
          </h2>

          {registrations.map((registration) => {
            const absensi = absensiStatus.get(registration.id)
            const jadwalDate = new Date(registration.jadwal.date)

            return (
              <Card
                key={registration.id}
                className={`border ${getStatusColor(registration)} transition-colors`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-100">
                        {registration.jadwal.pelatihan.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {registration.jadwal.location || "Lokasi belum ditentukan"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(registration)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Schedule Info */}
                  <div className="grid grid-cols-1 gap-4 py-3 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg md:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Nama Pelatihan</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {registration.jadwal.pelatihan.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Tanggal Jadwal</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {jadwalDate.toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Status Pendaftaran</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                        {registration.status}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Times */}
                  {absensi && (
                    <div className="grid grid-cols-2 gap-4 py-3 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Jam Check-In</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {absensi.checkIn
                            ? new Date(absensi.checkIn).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Jam Check-Out</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {absensi.checkOut
                            ? new Date(absensi.checkOut).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleCheckIn(registration.id)}
                      disabled={
                        submitting !== null ||
                        (absensi?.checkIn ? true : false) ||
                        (registration.status !== "PROSES" && registration.status !== "LULUS")
                      }
                      className="flex-1 gap-2"
                      variant={
                        absensi?.checkIn
                          ? "outline"
                          : "default"
                      }
                    >
                      {submitting === registration.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="h-4 w-4" />
                      )}
                      Check-In
                    </Button>

                    <Button
                      onClick={() => handleCheckOut(registration.id)}
                      disabled={
                        submitting !== null ||
                        !absensi?.checkIn ||
                        (absensi?.checkOut ? true : false) ||
                        (registration.status !== "PROSES" && registration.status !== "LULUS")
                      }
                      className="flex-1 gap-2"
                      variant={
                        absensi?.checkOut
                          ? "outline"
                          : "default"
                      }
                    >
                      {submitting === registration.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      Check-Out
                    </Button>
                  </div>

                  {/* Status Info */}
                  {registration.status !== "PROSES" && registration.status !== "LULUS" && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      ℹ️ Absensi hanya dapat dilakukan ketika status pendaftaran adalah PROSES atau LULUS
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
