import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, clear } = await request.json();

    const response = NextResponse.json({ ok: true });

    if (clear) {
      response.cookies.delete('ca_token');
    } else if (token) {
      response.cookies.set('ca_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
