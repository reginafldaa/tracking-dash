import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { MobileMenuButton } from "./MobileMenuButton";
import { ThemeToggle } from "@/components/theme-toggle";

export type UserSession = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

export default async function AdminHeader() {
  // Mengambil session secara aman di sisi server
  const session = await getServerSession(authOptions);

  const user = session?.user as UserSession | undefined;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Client Components dipanggil di dalam Server Component (Sangat Aman) */}
        <MobileMenuButton />
        <h2 className="text-xl font-semibold text-gray-800 hidden md:block">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium text-gray-700">{user?.name || user?.email || "Admin"}</span>
          <span className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || "Admin"}</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
