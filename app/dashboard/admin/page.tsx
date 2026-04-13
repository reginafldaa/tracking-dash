import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline">Kembali ke Induk</Link>
          <LogoutButton />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border hover:border-gray-300 transition-colors">
        <h2 className="text-xl font-semibold mb-2">Informasi Session (Server Side)</h2>
        <pre className="bg-slate-100 p-4 rounded text-sm text-gray-800 overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
        <div className="mt-4">
          <p className="text-gray-700">Email: <span className="font-medium text-black">{session.user.email}</span></p>
          <p className="text-gray-700">Role: <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{session.user.role}</span></p>
        </div>
      </div>
    </div>
  );
}
