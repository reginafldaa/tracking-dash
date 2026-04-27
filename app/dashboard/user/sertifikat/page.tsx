"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Award, Download, Eye, Clock, XCircle, CheckCircle2, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Pelatihan {
  id: string;
  name: string;
}

interface Jadwal {
  id: string;
  date: string;
  pelatihan?: Pelatihan;
}

interface Pendaftaran {
  id: string;
  status: "MENUNGGU" | "PROSES" | "LULUS" | "GAGAL";
  jadwal?: Jadwal;
  user?: { email: string };
  // Asumsi relasi Prisma one-to-one atau one-to-many. Disesuaikan dengan skema Anda.
  sertifikats?: { certificateUrl: string } | any;
}

// Komponen Pembantu untuk Badge Status
const StatusBadge = ({ status }: { status: string }) => {
  const safeStatus = status?.toUpperCase() || "";
  switch (safeStatus) {
    case "LULUS":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium border border-green-100 dark:border-green-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Lulus
        </span>
      );
    case "GAGAL":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-500/20">
          <XCircle className="w-3.5 h-3.5" /> Gagal
        </span>
      );
    default: // PROSES / MENUNGGU
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-500/20">
          <Clock className="w-3.5 h-3.5" /> Proses
        </span>
      );
  }
};

export default function UserSertifikatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Proteksi Route
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch Data Pelatihan User
  useEffect(() => {
    const fetchMyPendaftaran = async () => {
      if (!session?.user?.email) return;

      try {
        // Asumsi: Mengambil semua pendaftaran lalu di-filter berdasarkan email session.
        // Akan lebih baik jika Anda memiliki endpoint khusus misal: /api/pendaftaran/me
        const res = await fetch("/api/pendaftaran", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // Antisipasi jika data dibungkus dalam object (misal { data: [...] })
          const arrayData = Array.isArray(data) ? data : data.data || [];

          // Filter hanya pendaftaran milik user yang sedang login
          const myData = arrayData.filter((item: Pendaftaran) => item.user?.email === session.user?.email);
          setPendaftaranList(myData);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchMyPendaftaran();
    }
  }, [status, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-20 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Sertifikat Saya</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">Unduh sertifikat dari pelatihan yang telah Anda selesaikan.</p>
      </div>

      {/* Grid List Sertifikat / Pelatihan */}
      {pendaftaranList.length === 0 ? (
        <Card className="border-0 ring-1 ring-slate-200 dark:ring-slate-800 border-dashed bg-transparent">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Belum ada riwayat pelatihan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Anda belum terdaftar di pelatihan manapun. Ikuti pelatihan untuk mendapatkan sertifikat BNSP.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendaftaranList.map((item) => {
            const isLulus = item.status?.toUpperCase() === "LULUS";

            // Mengamankan penarikan URL sertifikat, berjaga-jaga jika relasinya berupa array atau object tunggal
            const certUrl = Array.isArray(item.sertifikats) ? item.sertifikats[0]?.certificateUrl : item.sertifikats?.certificateUrl;

            return (
              <Card key={item.id} className="flex flex-col border-0 ring-1 ring-slate-200 shadow-sm dark:ring-slate-800 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Top Section: Icon, Name, Badge */}
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isLulus ? "bg-blue-100 dark:bg-blue-900/50" : "bg-slate-100 dark:bg-slate-800"}`}>
                        <Award className={`w-5 h-5 ${isLulus ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{item.jadwal?.pelatihan?.name || "Pelatihan Tidak Diketahui"}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.jadwal?.date ? new Date(item.jadwal.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Spacer untuk menekan footer ke bawah */}
                  <div className="flex-1" />

                  {/* Bottom Section: Action Buttons / Info */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
                    {isLulus ? (
                      <div className="flex items-center gap-3">
                        {certUrl ? (
                          <>
                            {/* Tombol Preview */}
                            <a
                              href={certUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Lihat
                            </a>
                            {/* Tombol Download (Atribut download menginstruksikan browser mengunduh file) */}
                            <a
                              href={`/api/download?file=${encodeURIComponent(certUrl)}`}
                              className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                              <Download className="w-4 h-4" />
                              Unduh
                            </a>
                          </>
                        ) : (
                          <p className="text-sm text-yellow-600 dark:text-yellow-500 italic flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Sertifikat sedang diproses...
                          </p>
                        )}
                      </div>
                    ) : (
                      // Jika belum lulus (GAGAL / PROSES)
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{item.status === "GAGAL" ? "Sertifikat tidak tersedia." : "Selesaikan pelatihan untuk mendapatkan sertifikat."}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
