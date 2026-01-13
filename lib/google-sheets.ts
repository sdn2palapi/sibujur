
// Hardcoded URL as requested by user to avoid .env setup
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxo6WaZvX4aLIuyk99jB6g5awdR6rBHWgZqLsbGFww0OkHGPtjyeb2EVyr903o9NDRLmw/exec";

if (!GOOGLE_SCRIPT_URL) {
    console.warn("GOOGLE_SCRIPT_URL is not defined.");
}

type Action =
    | "getUsers" | "createUser" | "updateUser" | "deleteUser"
    | "getSuratMasuk" | "createSuratMasuk" | "updateSuratMasuk" | "deleteSuratMasuk"
    | "getSuratKeluar" | "createSuratKeluar" | "updateSuratKeluar" | "deleteSuratKeluar"
    | "getClassifications" | "saveClassifications"
    | "getSettings" | "updateSettings"
    | "uploadFile" | "updateUserAndCascade";

export async function fetchFromGoogleSheets(action: Action, data?: any) {
    if (!GOOGLE_SCRIPT_URL) {
        console.error("CRITICAL: GOOGLE_SCRIPT_URL is missing in fetchFromGoogleSheets!");
        throw new Error("GOOGLE_SCRIPT_URL is not defined");
    }

    try {
        let url = `${GOOGLE_SCRIPT_URL}?action=${action}`;
        let options: RequestInit = {
            method: "GET",
            cache: "no-store",
        };

        if (data) {
            url = GOOGLE_SCRIPT_URL;
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify({
                    action: action,
                    data: data
                }),
            };
        }

        console.log(`[GAS] Fetching ${action}...`);
        if (data) {
            console.log(`[GAS] Payload for ${action}:`, JSON.stringify(data, null, 2));
        }
        const response = await fetch(url, options);
        console.log(`[GAS] Response Status: ${response.status}`);

        if (!response.ok) {
            const text = await response.text();
            console.error(`[GAS] Error Response: ${text}`);
            throw new Error(`Failed to fetch from Google Sheets: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
            console.error(`[GAS] Script Error: ${result.error}`);
            throw new Error(result.error);
        }

        return result;
    } catch (error) {
        console.error(`Error in fetchFromGoogleSheets (${action}):`, error);
        throw error;
    }
}
