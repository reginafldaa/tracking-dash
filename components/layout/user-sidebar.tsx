"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  CalendarDays, 
  CheckSquare, 
  TrendingUp, 
  Award, 
  User,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
  { name: "Pendaftaran", href: "/dashboard/user/pendaftaran", icon: FileText },
  { name: "Jadwal Saya", href: "/dashboard/user/jadwal", icon: CalendarDays },
  { name: "Absensi", href: "/dashboard/user/absensi", icon: CheckSquare },
  { name: "Progress", href: "/dashboard/user/progress", icon: TrendingUp },
  { name: "Sertifikat", href: "/dashboard/user/sertifikat", icon: Award },
  { name: "Profil", href: "/dashboard/user/profil", icon: User },
]

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden dark:bg-slate-950/80"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 py-4 border-b dark:border-slate-800 lg:justify-center">
          <Link href="/dashboard/user" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
            <Award className="h-6 w-6" />
            <span className="tracking-tight">Sertifikasi BNSP</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <PanelLeftClose className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t dark:border-slate-800">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Butuh Bantuan?</h4>
            <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">
              Hubungi tim support kami untuk panduan platform.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
