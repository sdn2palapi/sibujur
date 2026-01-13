import { NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Format NIP and HP as text
        if (body.nip && !String(body.nip).startsWith("'")) {
            body.nip = `'${body.nip}`;
        }
        if (body.hp && !String(body.hp).startsWith("'")) {
            body.hp = `'${body.hp}`;
        }

        // Call Google Apps Script to handle update and cascading
        const result = await fetchFromGoogleSheets("updateUserAndCascade", body);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
