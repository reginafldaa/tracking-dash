"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Award, LayoutDashboard, Calendar, Users, ClipboardList, ClipboardCheck, FileBadge } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Jadwal", href: "/dashboard/admin/jadwal", icon: Calendar },
  { name: "Peserta", href: "/dashboard/admin/peserta", icon: Users },
  { name: "Pelatihan", href: "/dashboard/admin/pelatihan", icon: ClipboardList },
  { name: "Absensi", href: "/dashboard/admin/absensi", icon: ClipboardCheck },
  { name: "Sertifikat", href: "/dashboard/admin/sertifikat", icon: FileBadge },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "admin@bnsp.com";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col w-64 bg-blue-600 dark:bg-slate-900 text-white min-h-screen hidden md:flex">
      <div className="flex items-center gap-2 p-6 mb-4">
        <Award className="h-6 w-6 text-white" />
        <span className="text-xl font-bold tracking-tight">Sertifikasi BNSP</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? "bg-white text-blue-600 font-medium" : "text-blue-100 hover:bg-blue-700 dark:hover:bg-slate-800 hover:text-white"}`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-500 dark:border-slate-700">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center font-bold">{userInitial}</div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-blue-200">{userEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
