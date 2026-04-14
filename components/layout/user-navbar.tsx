"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Menu, Search, ChevronDown, User, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/LogoutButton"
import { useSession } from "next-auth/react"

interface NavbarProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export function Navbar({ setSidebarOpen }: NavbarProps) {
  const { data: session } = useSession()
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="hidden md:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 gap-6">
          <span className="text-slate-900 dark:text-white border-b-2 border-blue-600 pb-1">Peserta</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="hidden md:flex relative group">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari..." 
            className="h-8 w-48 rounded-full border border-slate-200 bg-slate-50 pl-8 pr-4 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative border-l pl-4 md:pl-6 dark:border-slate-700" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white shadow-sm">
              {userInitial}
            </div>
            <div className="hidden flex-col md:flex items-start">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">
                {session?.user?.name || "User"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Peserta</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 hidden md:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 origin-top-right">
              <div className="px-2 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session?.user?.name || "User"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email || "user@example.com"}</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">
                  <User className="h-4 w-4" />
                  Profil Saya
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </button>
              </div>
              
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="w-full flex items-center gap-2 rounded-md px-2 hover:bg-red-50 text-red-600 dark:hover:bg-red-950/50 dark:text-red-400 transition-colors">
                  <LogoutButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
