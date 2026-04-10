"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, Clock, PlayCircle } from "lucide-react"

export default function UserDashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-blue-600 rounded-xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, {session?.user?.name || "Peserta"}!</h1>
          <p className="text-blue-100 max-w-lg text-lg">
            Pantau progress pelatihan dan sertifikasi Anda di sini. Jangan lupa untuk melengkapi dokumen pendaftaran Anda.
          </p>
        </div>
        
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 right-40 -mb-20 w-48 h-48 rounded-full bg-indigo-500 opacity-40 blur-2xl"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Pelatihan</CardTitle>
            <PlayCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-800">Sedang Pelatihan</div>
            <p className="text-xs text-slate-500 mt-1">Sertifikasi BNSP Skema Web Developer</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absensi Kehadiran</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">12</span>
              <span className="text-sm text-slate-500 mb-1">/ 14 Hari</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full w-[85%] rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sertifikat Diperoleh</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-slate-500 mt-1">Junior Web Developer BNSP 2023</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Jadwal Terdekat</CardTitle>
            <CardDescription>Jadwal pelatihan dan assessment Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 p-3 border rounded-lg border-l-4 border-l-blue-500 bg-slate-50">
                <div className="flex flex-col items-center justify-center bg-white border rounded-md min-w-[60px] h-[60px] shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Mei</span>
                  <span className="text-xl font-bold text-slate-800">25</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Assessment Sertifikasi BNSP</h4>
                  <p className="text-sm text-slate-500 mt-1">08:00 - 15:00 WIB • TUK Sewaktu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Notifikasi Terbaru</CardTitle>
            <CardDescription>Informasi penting terkait sertifikasi Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm p-0 m-0">Dokumen persyaratan Anda telah <span className="font-semibold text-green-600">Terverifikasi</span> oleh Asesor.</p>
                  <p className="text-xs text-slate-500 mt-1">2 jam yang lalu</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-slate-300 flex-shrink-0"></div>
                <div>
                  <p className="text-sm p-0 m-0">Pengingat: Assessment BNSP akan dilaksanakan lusa. Harap persiapkan portofolio Anda.</p>
                  <p className="text-xs text-slate-500 mt-1">1 hari yang lalu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
