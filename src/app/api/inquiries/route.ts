import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { serviceName, name, company, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        serviceName,
        name,
        company,
        email,
        phone,
        message,
      },
    });

    // Send email notification
    if (process.env.RESEND_API_KEY) {
      try {
        const toEmails = ["info@welabtr.com", "pelingilik1@gmail.com"];
        
        // Add specific department emails if applicable
        const lowerService = serviceName?.toLowerCase() || "";
        if (lowerService.includes("sale")) {
          toEmails.push("satis@welabtr.com");
        }
        if (lowerService.includes("care") || lowerService.includes("servis")) {
          toEmails.push("servis@welabtr.com");
        }

        await resend.emails.send({
          from: "Welab Service Inquiry <info@welabtr.com>",
          to: toEmails,
          replyTo: email,
          subject: `New Service Inquiry: ${serviceName || "General"}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #6200ea;">New Inquiry for ${serviceName || "General Service"}</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Company:</strong> ${company || "N/A"}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Message:</strong></p>
              <p style="background: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send inquiry email:", emailError);
      }
    } else {
      console.log("\n[MOCK EMAIL] No RESEND_API_KEY set. Logging inquiry:");
      console.log(`To: ${serviceName}, From: ${name} <${email}>, Message: ${message}`);
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Inquiry error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
