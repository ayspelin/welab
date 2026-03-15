import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role === 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const dealer = await prisma.dealer.update({
            where: { id },
            data: {
                name: data.name,
                city: data.city,
                address: data.address,
                phone: data.phone,
                email: data.email,
                website: data.website,
                isActive: data.isActive,
            },
        });

        return NextResponse.json(dealer);
    } catch (error) {
        console.error('Error updating dealer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role === 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.dealer.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Dealer deleted' });
    } catch (error) {
        console.error('Error deleting dealer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
