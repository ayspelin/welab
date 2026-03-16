import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_fallback_for_build");

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "E-posta adresi zorunludur." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // If user doesn't exist, we still return a success message for security (prevent email enumeration)
        if (!user) {
            return NextResponse.json(
                { message: "Eğer sistemimizde bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderilmiştir." },
                { status: 200 }
            );
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");
        // Expire in 1 hour
        const resetTokenExpires = new Date(Date.now() + 3600000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpires,
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        if (!process.env.RESEND_API_KEY) {
            console.log("\n[MOCK EMAIL] Password Reset Email for:", email);
            console.log("Reset Link:", resetUrl, "\n");
        } else {
            await resend.emails.send({
                from: "Welab Security <info@welabtr.com>",
                to: [email],
                subject: "Şifre Sıfırlama Talebi",
                html: `
                    <h2>Şifre Sıfırlama</h2>
                    <p>Welab hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
                    <p>Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
                    <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; color:#fff; background-color:#1d4ed8; text-decoration:none; border-radius:5px;">Şifreyi Sıfırla</a>
                    <p>Eğer bu talebi siz yapmadıysanız bu e-postayı dikkate almayınız. Bu bağlantı 1 saat boyunca geçerlidir.</p>
                `,
            });
        }

        return NextResponse.json(
            { message: "Eğer sistemimizde bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderilmiştir." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ message: "Sunucu hatası oluştu." }, { status: 500 });
    }
}
