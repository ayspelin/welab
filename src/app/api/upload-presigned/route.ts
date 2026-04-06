import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from 'crypto';

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const body = await req.json();
        const { filename, contentType } = body;

        if (!filename || !contentType) {
            return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
        }

        const uniqueFileName = `${crypto.randomUUID()}-${filename.replace(/\s+/g, '-')}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: uniqueFileName,
            ContentType: contentType,
        });

        // Generate signed URL valid for 15 minutes
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

        return NextResponse.json({ presignedUrl, fileUrl }, { status: 200 });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
    }
}
