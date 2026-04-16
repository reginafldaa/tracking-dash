import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password harus diisi." },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah digunakan." },
        { status: 400 }
      );
    }

    // Enkripsi password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru di database
    const newUser = await prisma.user.create({
      data: {
        name, // Opsional, sesuai skema kamu (String?)
        email,
        password: hashedPassword,
      },
    });

    // Kembalikan response sukses (jangan kembalikan password!)
    return NextResponse.json(
      { message: "Registrasi berhasil!", user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server, silakan coba lagi." },
      { status: 500 }
    );
  }
}