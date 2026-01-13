import { NextRequest, NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file: File | null = formData.get('file') as unknown as File;
        const folder = formData.get('folder') as string | null;
        const customFilename = formData.get('customFilename') as string | null;

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Content = buffer.toString('base64');

        // Send to GAS
        const result = await fetchFromGoogleSheets("uploadFile", {
            name: file.name,
            mimeType: file.type,
            content: base64Content,
            folder: folder || "default", // Pass folder name
            customFilename: customFilename // Pass custom filename if exists
        });

        if (result.status === "success") {
            console.log("[API] Upload success:", result.url);
            return NextResponse.json({
                success: true,
                url: result.url,
                name: file.name
            });
        } else {
            throw new Error(result.error || "Upload failed");
        }

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
    }
}
