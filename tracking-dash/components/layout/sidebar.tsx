"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, BookOpen, Calendar, CheckSquare, ClipboardList, Award } from "lucide-react"

interface SidebarProps {
  role: "ADMIN" | "USER"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Pelatihan", href: "/dashboard/admin/pelatihan", icon: BookOpen },
    { name: "Jadwal", href: "/dashboard/admin/jadwal", icon: Calendar },
    { name: "Pendaftar", href: "/dashboard/admin/peserta", icon: Users },
    { name: "Absensi", href: "/dashboard/admin/absensi", icon: CheckSquare },
    { name: "Sertifikat", href: "/dashboard/admin/sertifikat", icon: Award },
  ]

  const userLinks = [
    { name: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
    { name: "Pendaftaran", href: "/dashboard/user/daftar", icon: ClipboardList },
    { name: "Jadwal Saya", href: "/dashboard/user/jadwal", icon: Calendar },
    { name: "Absensi", href: "/dashboard/user/absensi", icon: CheckSquare },
    { name: "Sertifikat", href: "/dashboard/user/sertifikat", icon: Award },
  ]

  const links = role === "ADMIN" ? adminLinks : userLinks

  return (
    <div className="hidden border-r bg-white md:block md:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href={`/dashboard/${role.toLowerCase()}`} className="flex items-center gap-2 font-bold text-xl text-blue-700">
            <Award className="h-6 w-6" />
            <span className="">Sertifikasi BNSP</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
