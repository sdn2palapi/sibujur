import { NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function GET() {
    try {
        const users = await fetchFromGoogleSheets("getUsers");
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newUser = await request.json();

        // Format NIP and HP as text
        if (newUser.nip && !String(newUser.nip).startsWith("'")) {
            newUser.nip = `'${newUser.nip}`;
        }
        if (newUser.hp && !String(newUser.hp).startsWith("'")) {
            newUser.hp = `'${newUser.hp}`;
        }

        const result = await fetchFromGoogleSheets("createUser", newUser);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const updatedUser = await request.json();

        // Format NIP and HP as text
        if (updatedUser.nip && !String(updatedUser.nip).startsWith("'")) {
            updatedUser.nip = `'${updatedUser.nip}`;
        }
        if (updatedUser.hp && !String(updatedUser.hp).startsWith("'")) {
            updatedUser.hp = `'${updatedUser.hp}`;
        }

        const result = await fetchFromGoogleSheets("updateUser", updatedUser);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const result = await fetchFromGoogleSheets("deleteUser", { id });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
