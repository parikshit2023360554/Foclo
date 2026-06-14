import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const next = searchParams.get('next') ?? '/dashboard';

  // Handle OAuth errors from Google
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(`${origin}/sign-up-login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', exchangeError.message);
      return NextResponse.redirect(`${origin}/sign-up-login?error=auth-callback-failed`);
    }

    if (data?.session) {
      // Redirect to dashboard — append tokens so browser Supabase client picks them up
      const redirectUrl = new URL(`${origin}${next}`);
      
      const response = NextResponse.redirect(redirectUrl.toString());
      
      // Set session cookies for the browser
      const isProd = process.env.NODE_ENV === 'production';
      
      response.cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        maxAge: data.session.expires_in,
      });

      response.cookies.set('sb-refresh-token', data.session.refresh_token!, {
        path: '/',
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });

      return response;
    }
  }

  // No code — redirect to dashboard anyway (session might be in URL hash from implicit flow)
  return NextResponse.redirect(`${origin}${next}`);
}
