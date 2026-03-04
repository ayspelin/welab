import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(new URL("/login?error=MissingToken", req.url));
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.redirect(new URL("/login?error=InvalidToken", req.url));
        }

        const userId = decoded.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.redirect(new URL("/login?error=UserNotFound", req.url));
        }

        if (user.emailVerified) {
            return NextResponse.redirect(new URL("/login?message=AlreadyVerified", req.url));
        }

        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true },
        });

        // Redirect to login page with a success message
        return NextResponse.redirect(new URL("/login?message=EmailVerified", req.url));

    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.redirect(new URL("/login?error=ServerError", req.url));
    }
}
