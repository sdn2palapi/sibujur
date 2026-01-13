import { NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function GET() {
    try {
        const data = await fetchFromGoogleSheets("getSuratKeluar");
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading surat-keluar:", error);
        return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newItem = await request.json();

        // Format Nomor as text
        if (newItem.nomor && !String(newItem.nomor).startsWith("'")) {
            newItem.nomor = `'${newItem.nomor}`;
        }

        const result = await fetchFromGoogleSheets("createSuratKeluar", newItem);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error saving surat-keluar:", error);
        return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const updatedItem = await request.json();

        // Format Nomor as text
        if (updatedItem.nomor && !String(updatedItem.nomor).startsWith("'")) {
            updatedItem.nomor = `'${updatedItem.nomor}`;
        }

        const result = await fetchFromGoogleSheets("updateSuratKeluar", updatedItem);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating surat-keluar:", error);
        return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const result = await fetchFromGoogleSheets("deleteSuratKeluar", { id });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error deleting surat-keluar:", error);
        return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
    }
}
