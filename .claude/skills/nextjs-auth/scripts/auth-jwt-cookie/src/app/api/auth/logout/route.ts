import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookieHeader } from '../../../../lib/session-cookie';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.headers.append('Set-Cookie', clearSessionCookieHeader(request));
  return response;
}
