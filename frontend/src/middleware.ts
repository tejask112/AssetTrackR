import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const session = req.cookies.get('session')?.value;

    if (pathname !== '/Welcome' && !session) {
        const url = req.nextUrl.clone();
        url.pathname = '/Welcome';
        if (pathname !== '/') {
            url.searchParams.set('redirect', `${pathname}${search || ''}`);
        }
        return NextResponse.redirect(url);
    }

    if (pathname === '/Welcome' && session) {
        const url = req.nextUrl.clone();
        url.pathname = '/Home';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};
