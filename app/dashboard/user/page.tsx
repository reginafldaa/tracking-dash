"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect manually is optional since middleware already handles protection,
  // but this shows how component state behaves.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-8"><p className="text-gray-500 animate-pulse">Loading session...</p></div>;
  }

  if (!session) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline">Kembali ke Induk</Link>
          <LogoutButton />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-2">Informasi Session (Client Side)</h2>
        <pre className="bg-slate-100 p-4 rounded text-sm text-gray-800 overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-gray-700">Nama: <span className="font-medium">{session.user.name || "-"}</span></p>
          <p className="text-gray-700">Email: <span className="font-medium">{session.user.email}</span></p>
          <p className="text-gray-700">Role: <span className="font-medium bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{session.user.role}</span></p>
        </div>
      </div>
    </div>
  );
}
