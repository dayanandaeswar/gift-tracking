import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// proxy.ts replaces middleware.ts in Next.js 16
// Same API — just renamed to clarify the network boundary role
export function proxy(request: NextRequest) {
    const token = request.cookies.get('gt_token')?.value;
    const { pathname } = request.nextUrl;
    const isLoginPage = pathname === '/login';
    const isStatic = pathname.startsWith('/_next')
        || pathname.startsWith('/favicon');

    if (isStatic) return NextResponse.next();

    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/functions', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
