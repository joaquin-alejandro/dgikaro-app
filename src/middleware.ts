import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Si no hay variables, redirigimos a login o tiramos un error, NUNCA dejamos pasar
    if (!supabaseUrl || !supabaseKey) {
        console.error("FALTAN VARIABLES DE SUPABASE EN EL ENTORNO (Dokploy)");
        if (request.nextUrl.pathname !== '/login') {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAuthPage = request.nextUrl.pathname === '/login';

    if (!user && !isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/alumnos'; // Redirecting to /alumnos instead of /
        return NextResponse.redirect(url);
    }

    // Proteger el acceso a la raíz '/'
    if (user && request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/alumnos';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
