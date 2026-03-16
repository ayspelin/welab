import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ message: "Token ve yeni şifre zorunludur." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { resetToken: token },
        });

        if (!user) {
            return NextResponse.json({ message: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 400 });
        }

        if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            return NextResponse.json({ message: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        return NextResponse.json({ message: "Şifreniz başarıyla güncellendi. Artık giriş yapabilirsiniz." }, { status: 200 });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ message: "Sunucu hatası oluştu." }, { status: 500 });
    }
}
