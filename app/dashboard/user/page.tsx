"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, Clock, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserAbsensiClient } from "@/components/user-absensi-client";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    // Skeleton loading
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userName = session?.user?.name || "User";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Section (Welcome Card) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-900 shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        
        <div className="relative px-8 py-12 md:p-12 z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xl text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Selamat Datang, {userName}
            </h1>
            <p className="text-blue-100 mb-8 text-lg">
              Tingkatkan kompetensi Anda dan dapatkan sertifikasi BNSP resmi untuk menunjang karir profesional Anda.
            </p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2">
              Daftar Sekarang
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="hidden md:block">
            {/* Optional Illustration Placeholder */}
            <div className="w-64 h-48 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner flex items-center justify-center p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <BookOpen className="w-24 h-24 text-white/80" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pelatihan */}
        <Card className="flex flex-col border-0 ring-1 ring-slate-200 shadow-sm dark:ring-slate-800">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Dashboard Peserta</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">1 Sertifikasi</span>
          </div>
          <CardContent className="p-6 flex-1 flex flex-col gap-6">
            <div className="rounded-xl bg-blue-50 dark:bg-slate-800/80 p-5 border border-blue-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-blue-900 dark:text-blue-100">Status: Sedang Pelatihan</span>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">65%</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-blue-200/50 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 text-right">Tahap 3 dari 5 selesai</p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Pelatihan Web Developer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Aktif</p>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                25 Mei 2024
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Riwayat Pelatihan */}
        <Card className="flex flex-col border-0 ring-1 ring-slate-200 shadow-sm dark:ring-slate-800">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Riwayat Pelatihan</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">Lihat Semua</button>
          </div>
          <CardContent className="p-6 flex-1">
            <div className="space-y-4">
              {/* Item Riwayat */}
              <div className="group rounded-xl border border-slate-100 dark:border-slate-800 p-4 hover:border-green-200 dark:hover:border-green-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Pelatihan Sertifikasi BNSP</h3>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">12 Feb 2024</span>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium border border-green-100 dark:border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selesai
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                    Sertifikat Tersedia
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Absensi Section */}
      <div className="space-y-4">
        <UserAbsensiClient />
      </div>
    </div>
  );
}
