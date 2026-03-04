import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isApproved: true,
                emailVerified: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, isApproved } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "Kullanıcı ID gereklidir." }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { isApproved },
        });

        // Notify user if newly approved
        if (isApproved && user.email) {
            const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login`;

            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: "Welab Security <onboarding@resend.dev>",
                    to: ["pelingilik1@gmail.com"], // TEMPORARY: testing email requested by user
                    subject: "Your Dealer Account has been Approved",
                    html: `
                        <h2>Account Approved</h2>
                        <p>Hi,</p>
                        <p>Your dealer account has been approved by the administrators.</p>
                        <p>You can now log in to the portal using the link below:</p>
                        <a href="${loginUrl}" style="display:inline-block; padding:10px 20px; color:#fff; background-color:#1d4ed8; text-decoration:none; border-radius:5px;">Login to Portal</a>
                    `,
                });
            }
        }

        return NextResponse.json({ message: "Kullanıcı durumu güncellendi." }, { status: 200 });

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Kullanıcı güncellenemedi." }, { status: 500 });
    }
}
