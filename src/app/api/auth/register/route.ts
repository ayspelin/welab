import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "E-posta ve şifre zorunludur." }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "Bu e-posta adresi zaten kayıtlı." }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user (Role defaults to DEALER, isApproved config is false by default)
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: "DEALER",
                isApproved: false,
                emailVerified: false,
            },
        });

        // Generate verification token
        const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "24h" });

        // Build verification link
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const verifyLink = `${baseUrl}/api/auth/verify?token=${token}`;

        // Send Email
        if (!process.env.RESEND_API_KEY) {
            console.log("\n[MOCK EMAIL] Verification Email for:", email);
            console.log("Verification Link:", verifyLink, "\n");
        } else {
            await resend.emails.send({
                from: "Welab Security <onboarding@resend.dev>",
                to: ["pelingilik1@gmail.com"], // TEMPORARY: testing email requested by user
                subject: "Please verify your email address",
                html: `
                    <h2>Welcome to Welab Dealer Portal</h2>
                    <p>To verify your email address and proceed with the registration process, please click the link below:</p>
                    <a href="${verifyLink}" style="display:inline-block; padding:10px 20px; color:#fff; background-color:#1d4ed8; text-decoration:none; border-radius:5px;">Verify Email</a>
                    <p>If you did not request this, please ignore this email.</p>
                `,
            });
        }

        return NextResponse.json({ message: "Kayıt başarılı. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın." }, { status: 201 });

    } catch (error: any) {
        console.error("Register Error:", error);
        return NextResponse.json({ message: "Sunucu hatası oluştu." }, { status: 500 });
    }
}
