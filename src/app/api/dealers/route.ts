import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city');

        const dealers = await prisma.dealer.findMany({
            where: {
                isActive: true,
                ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
            },
            orderBy: { city: 'asc' },
        });

        return NextResponse.json(dealers);
    } catch (error) {
        console.error('Error fetching dealers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role === 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const dealer = await prisma.dealer.create({
            data: {
                name: data.name,
                city: data.city,
                address: data.address,
                phone: data.phone,
                email: data.email,
                website: data.website,
                isActive: data.isActive ?? true,
            },
        });

        return NextResponse.json(dealer);
    } catch (error) {
        console.error('Error creating dealer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
