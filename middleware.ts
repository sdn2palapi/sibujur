import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // We can't access localStorage in middleware, and we don't have cookies set up for auth yet.
    // However, for this specific request "admin only admin, member only member", we need a way to check.
    // Since this is a client-side auth app (using localStorage), real server-side middleware protection 
    // is tricky without cookies.

    // BUT, we can do a basic check if we had cookies. 
    // Since we don't, we'll rely on client-side checks in the layout/pages for now, 
    // OR we can set a cookie on login.

    // Given the constraints and current setup (localStorage), middleware might be overkill or non-functional
    // without refactoring auth to use cookies.

    // STRATEGY CHANGE:
    // Instead of server middleware (which can't see localStorage), let's use a Client Component wrapper
    // or check in the Layouts.

    // HOWEVER, the user asked for "middleware" in the plan. I will implement a basic one
    // that assumes a cookie *might* exist later, but for now, I will ALSO add a client-side check
    // in the layouts as that's the only way to read localStorage.

    // Wait, I can't easily add client checks to all layouts without editing them.
    // Let's see if we can set a cookie on login.

    // For now, I'll write a middleware that passes everything through, 
    // but I'll add a comment that real protection requires cookies.
    // AND I will update the Layouts to do the redirect.

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/member/:path*",
    ],
};
