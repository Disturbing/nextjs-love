import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookieHeader } from '../../../../lib/session-cookie';
import { AuthServiceError, registerUser } from '../../../../services/auth-service';
import type { AuthMutationResponse } from '../../../../types/auth';

function createErrorResponse(error: AuthServiceError): NextResponse<AuthMutationResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.field ? { field: error.field } : {}),
      },
    },
    { status: error.status },
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<AuthMutationResponse>(
      { ok: false, error: { code: 'INVALID_JSON', message: 'Invalid request body.' } },
      { status: 400 },
    );
  }

  try {
    const session = await registerUser((body ?? {}) as Record<string, unknown>);
    const response = NextResponse.json<AuthMutationResponse>({
      ok: true,
      data: { user: session.user },
    });
    response.headers.append('Set-Cookie', createSessionCookieHeader(session.token, request));
    return response;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return createErrorResponse(error);
    }

    return NextResponse.json<AuthMutationResponse>(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Unable to create your account right now.' } },
      { status: 500 },
    );
  }
}
