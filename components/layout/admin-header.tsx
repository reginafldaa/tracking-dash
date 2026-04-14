import { LogoutButton } from "@/components/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MobileMenuButton } from "./MobileMenuButton";

export async function AdminHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <MobileMenuButton />
        <h2 className="text-xl font-semibold text-gray-800 hidden md:block">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium text-gray-700">
            {session?.user?.name || session?.user?.email || "Admin"}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {session?.user?.role?.toLowerCase() || "Admin"}
          </span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
