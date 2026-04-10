"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, CalendarCheck, CheckCircle } from "lucide-react"

// For the demo charts, we'll use placeholder data.
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const chartData = [
  { name: "Jan", peserta: 40 },
  { name: "Feb", peserta: 65 },
  { name: "Mar", peserta: 80 },
  { name: "Apr", peserta: 120 },
  { name: "Mei", peserta: 95 },
  { name: "Jun", peserta: 150 },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Statistik</h1>
        <p className="text-slate-500 mt-1">Ringkasan aktivitas pelatihan dan sertifikasi.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-slate-500 mt-1">+15% dari bulan lalu</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pelatihan</CardTitle>
            <GraduationCap className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-slate-500 mt-1">3 pelatihan aktif saat ini</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Kelulusan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-slate-500 mt-1">Di atas rata-rata 85%</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
            <CalendarCheck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">32</div>
            <p className="text-xs text-slate-500 mt-1">Pendaftaran baru</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Pertumbuhan Peserta</CardTitle>
            <CardDescription>Grafik jumlah peserta per bulan (Tahun Ini)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="peserta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Pendaftar Terbaru</CardTitle>
            <CardDescription>Peserta yang baru mendaftar hari ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Agus Santoso", email: "agus.s@email.com", status: "Proses" },
                { name: "Budi Setiawan", email: "budis@email.com", status: "Proses" },
                { name: "Citra Kirana", email: "citra.k@email.com", status: "Terverifikasi" },
                { name: "Deni Pratama", email: "denip@email.com", status: "Terverifikasi" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                      {p.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{p.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{p.email}</p>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${p.status === 'Proses' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {p.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
