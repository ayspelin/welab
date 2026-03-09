import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            where: { isActive: true },
            orderBy: { date: 'desc' },
        });
        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { title_tr, title_en, location, date, imageUrl, description_tr, description_en, isActive } = data;

        if (!title_tr || !date) {
            return NextResponse.json({ error: "title_tr and date are required" }, { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                title_tr, title_en, location,
                date: new Date(date),
                imageUrl, description_tr, description_en,
                isActive: isActive ?? true,
            }
        });
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
