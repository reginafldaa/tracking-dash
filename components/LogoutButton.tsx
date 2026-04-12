"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition shadow-sm"
    >
      Keluar (Logout)
    </button>
  );
}
