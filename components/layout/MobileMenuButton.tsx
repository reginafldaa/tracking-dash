"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ClipboardCheck, 
  FileBadge,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Jadwal", href: "/dashboard/admin/jadwal", icon: Calendar },
  { name: "Peserta", href: "/dashboard/admin/peserta", icon: Users },
  { name: "Absensi", href: "/dashboard/admin/absensi", icon: ClipboardCheck },
  { name: "Sertifikat", href: "/dashboard/admin/sertifikat", icon: FileBadge },
];

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-blue-600 text-white p-0 border-r-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu Navigasi Mobile</SheetTitle>
        </SheetHeader>
        <div className="flex items-center gap-2 p-6 mb-4">
          <Building2 className="h-6 w-6 text-white" />
          <span className="text-xl font-bold tracking-tight">Sertifikasi BNSP</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? "bg-white text-blue-600 font-medium" 
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-blue-500">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center font-bold">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin Start</span>
              <span className="text-xs text-blue-200">admin@bnsp.com</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
