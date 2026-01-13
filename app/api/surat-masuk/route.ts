import { NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function GET() {
    try {
        const data = await fetchFromGoogleSheets("getSuratMasuk");
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading surat-masuk:", error);
        return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newItem = await request.json();

        // Format Nomor and Kode as text
        if (newItem.nomor && !String(newItem.nomor).startsWith("'")) {
            newItem.nomor = `'${newItem.nomor}`;
        }
        if (newItem.kode && !String(newItem.kode).startsWith("'")) {
            newItem.kode = `'${newItem.kode}`;
        }

        const result = await fetchFromGoogleSheets("createSuratMasuk", newItem);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error saving surat-masuk:", error);
        return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const updatedItem = await request.json();

        // Format Nomor and Kode as text
        if (updatedItem.nomor && !String(updatedItem.nomor).startsWith("'")) {
            updatedItem.nomor = `'${updatedItem.nomor}`;
        }
        if (updatedItem.kode && !String(updatedItem.kode).startsWith("'")) {
            updatedItem.kode = `'${updatedItem.kode}`;
        }

        const result = await fetchFromGoogleSheets("updateSuratMasuk", updatedItem);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating surat-masuk:", error);
        return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const result = await fetchFromGoogleSheets("deleteSuratMasuk", { id });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error deleting surat-masuk:", error);
        return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
    }
}
