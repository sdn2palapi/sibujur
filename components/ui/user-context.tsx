"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserState {
    id?: number;
    name: string;
    role: string;
    jabatan: string;
    username?: string;
    avatar: string | null;
}

interface UserContextType {
    user: UserState;
    updateUser: (updates: Partial<UserState>) => void;
    refreshUser: () => Promise<void>;
}

const defaultUser: UserState = {
    id: undefined,
    name: "", // Empty default to avoid stale data
    role: "",
    jabatan: "",
    username: "",
    avatar: null,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserState>(defaultUser);

    const refreshUser = async () => {
        // Check localStorage for the most up-to-date role
        // State might be stale during initial render/effects
        const stored = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
        const currentRole = stored ? JSON.parse(stored).role : user.role;

        // Only refresh from settings if the user is an Admin
        if (currentRole !== "Admin") return;

        try {
            const res = await fetch("/api/settings", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                console.log("[UserContext] Refreshed user data:", data);
                if (data && Object.keys(data).length > 0) {
                    setUser((prev) => ({
                        ...prev,
                        name: data.namaAdmin || prev.name,
                        jabatan: data.jabatanAdmin || prev.jabatan,
                        username: data.usernameAdmin || prev.username,
                        avatar: data.fotoProfil || prev.avatar,
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to refresh user data:", error);
        }
    };

    const updateUser = (updates: Partial<UserState>) => {
        setUser((prev) => ({ ...prev, ...updates }));
    };

    // Initial fetch
    useEffect(() => {
        // Load logged-in user from localStorage to get the correct System Role
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser((prev) => ({
                ...prev,
                id: parsed.id || prev.id,
                role: parsed.role || prev.role,
                name: parsed.name || prev.name,
                username: parsed.username || prev.username,
                // Use role as default jabatan if not explicitly set
                jabatan: parsed.jabatan || parsed.role || prev.jabatan,
                avatar: parsed.avatar || prev.avatar,
            }));
        }

        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, updateUser, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
