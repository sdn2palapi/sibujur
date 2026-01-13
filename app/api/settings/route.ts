import { NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function GET() {
    try {
        const settings = await fetchFromGoogleSheets("getSettings");
        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error reading settings:", error);
        return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let step = "init";
    try {
        const data = await request.json();
        console.log("[API] Received settings data:", data);

        // Format phone numbers as text for Google Sheets
        // We prepend ' to force Google Sheets to treat it as text
        if (data.hpAdmin) {
            const hp = String(data.hpAdmin);
            if (!hp.startsWith("'")) {
                data.hpAdmin = `'${hp}`;
            }
        }
        if (data.teleponSekolah) {
            const tel = String(data.teleponSekolah);
            if (!tel.startsWith("'")) {
                data.teleponSekolah = `'${tel}`;
            }
        }

        // 1. Update Settings
        step = "updateSettings";
        try {
            const settingsResult = await fetchFromGoogleSheets("updateSettings", data);
            console.log("[API] updateSettings result:", settingsResult);
        } catch (e: any) {
            throw new Error(`Failed to update settings: ${e.message}`);
        }

        // 2. Sync Admin details to Users sheet
        step = "syncAdmin";
        try {
            // We fetch users first to find the admin
            const users = await fetchFromGoogleSheets("getUsers");
            if (Array.isArray(users)) {
                const adminUser = users.find((u: any) => u.role === "Admin");

                if (adminUser) {
                    console.log("[API] Found admin user:", adminUser.id);
                    let updated = false;
                    let updates: any = { id: adminUser.id };

                    if (data.namaAdmin && adminUser.name !== data.namaAdmin) {
                        updates.name = data.namaAdmin;
                        updated = true;
                    }
                    if (data.usernameAdmin && adminUser.username !== data.usernameAdmin) {
                        updates.username = data.usernameAdmin;
                        updated = true;
                    }
                    if (data.fotoProfil && adminUser.avatar !== data.fotoProfil) {
                        updates.avatar = data.fotoProfil;
                        updated = true;
                    }
                    if (data.jabatanAdmin && adminUser.jabatan !== data.jabatanAdmin) {
                        updates.jabatan = data.jabatanAdmin;
                        updated = true;
                    }

                    if (updated) {
                        console.log("[API] Syncing admin user updates:", updates);
                        await fetchFromGoogleSheets("updateUser", updates);
                    } else {
                        console.log("[API] No updates needed for admin user");
                    }
                } else {
                    console.warn("[API] Admin user not found in Users sheet");
                }
            }
        } catch (e: any) {
            console.error("Error syncing admin user:", e);
            // We don't throw here to allow settings to be saved even if sync fails
            // But we might want to know about it. For now, let's just log it.
        }

        return NextResponse.json({ success: true, message: "Settings saved successfully" });
    } catch (error: any) {
        console.error(`Error saving settings (${step}):`, error);
        return NextResponse.json({ error: `Error in ${step}: ${error.message}` }, { status: 500 });
    }
}
