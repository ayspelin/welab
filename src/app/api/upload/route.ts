import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

        // Only admins can upload files
        // if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create unique filename
        const uniqueFileName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, '-')}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: file.type,
            // ACL: 'public-read', // Deprecated in many new S3 buckets, rely on Bucket Policy instead
        });

        await s3Client.send(command);

        // Assuming standard S3 URL format. If using CloudFront, replace this with CloudFront domain.
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

        return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
