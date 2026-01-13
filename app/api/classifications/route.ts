import { NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function GET() {
    try {
        const data = await fetchFromGoogleSheets("getClassifications");
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading classifications:", error);
        return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        let data = await request.json();

        // Format codes as text for Google Sheets to preserve leading zeros (e.g. 001)
        if (Array.isArray(data)) {
            data = data.map((item: any) => {
                if (item.code) {
                    const code = String(item.code);
                    if (!code.startsWith("'")) {
                        return { ...item, code: `'${code}` };
                    }
                }
                return item;
            });
        }

        // Fetch current data to check length for "tail overwrite"
        const currentData = await fetchFromGoogleSheets("getClassifications");

        if (Array.isArray(currentData) && Array.isArray(data)) {
            if (data.length < currentData.length) {
                const diff = currentData.length - data.length;
                console.log(`[API] Padding ${diff} empty rows to clear tail data.`);
                for (let i = 0; i < diff; i++) {
                    data.push({ code: "", label: "", type: "" });
                }
            }
        }

        const result = await fetchFromGoogleSheets("saveClassifications", data);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error saving classifications:", error);
        return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
    }
}
