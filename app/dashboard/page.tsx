import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardMainPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Redirect to respective sub-dashboards based on Role (Optional Default Dashboard Logic)
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard Utama</h1>
      <p className="mb-6">Selamat Datang, {session.user.name || session.user.email}!</p>
      
      <div className="flex gap-4 items-center">
        {session.user.role === "ADMIN" && (
          <Link href="/dashboard/admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Masuk Admin Dashboard
          </Link>
        )}
        <Link href="/dashboard/user" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          Masuk User Dashboard
        </Link>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
