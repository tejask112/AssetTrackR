// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const session = req.cookies.get('session')?.value;

    if (pathname !== '/Welcome' && !session) {
        const url = req.nextUrl.clone();
        url.pathname = '/Welcome';
        
        if (pathname !== '/' && pathname !== '/Home') {
            url.searchParams.set('redirect', pathname);
        }
        
        return NextResponse.redirect(url);
    }

    if (pathname === '/Welcome' && session) {
        return NextResponse.redirect(new URL('/Home', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|images|favicon.ico|public).*)',
    ],
};