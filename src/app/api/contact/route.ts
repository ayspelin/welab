import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, phone, subject, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { message: "Name, email, and message are required." },
                { status: 400 }
            );
        }

        // Fetch the site settings to get the destination email
        const setting = await prisma.setting.findFirst();

        // If Resend API Key is missing, just log the message for now (helps in local dev without breaking)
        if (!process.env.RESEND_API_KEY) {
            console.log("\n[MOCK EMAIL] Since RESEND_API_KEY is not set, logging the message:");
            console.log(`From: ${name} <${email}>`);
            console.log(`Subject: ${subject}`);
            console.log(`Message: \n${message}\n`);

            return NextResponse.json({ message: "Message logged successfully (mock)." }, { status: 200 });
        }

        // Determine destination: Try the setting email, otherwise the onboarding email requires sending to your own verified account email. 
        // TEMPORARY: User requested to send emails to pelingilik1@gmail.com for testing.
        const toEmail = "pelingilik1@gmail.com";

        const data = await resend.emails.send({
            from: "Welab Website <onboarding@resend.dev>", // Needs to be a verified domain in production
            to: [toEmail],
            replyTo: email,
            subject: `New Contact Form Message: ${subject || "General Inquiry"}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0d47a1;">New Message from Welab Contact Form</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                    <p><strong>Subject:</strong> ${subject || "N/A"}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Message:</strong></p>
                    <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
                </div>
            `,
        });

        if (data.error) {
            throw new Error(data.error.message);
        }

        return NextResponse.json({ message: "Email sent successfully!", data }, { status: 200 });

    } catch (error: any) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { message: "Failed to send message.", error: error.message },
            { status: 500 }
        );
    }
}
