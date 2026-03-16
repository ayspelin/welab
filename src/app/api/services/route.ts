import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const service = await prisma.service.create({
      data: {
        name: data.name,
        name_tr: data.name_tr,
        name_en: data.name_en,
        suffix: data.suffix,
        description_tr: data.description_tr,
        description_en: data.description_en,
        icon: data.icon,
        color: data.color,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
