export const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type CookieRequestLike = {
  headers: Headers;
  nextUrl?: URL;
};

type SessionCookiePolicy = {
  sameSite: 'Lax' | 'None';
  secure: boolean;
  partitioned: boolean;
};

function shouldUseSecureCookies(request: CookieRequestLike): boolean {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl?.host ??
    '';
  const hostname = host.split(':')[0]?.toLowerCase() ?? '';

  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1') {
    return false;
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return request.nextUrl?.protocol === 'https:';
}

function isEmbeddedPreviewHost(request: CookieRequestLike): boolean {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl?.host ??
    '';
  const hostname = host.split(':')[0]?.toLowerCase() ?? '';

  return hostname.startsWith('dev-');
}

function getSessionCookiePolicy(request: CookieRequestLike): SessionCookiePolicy {
  if (isEmbeddedPreviewHost(request)) {
    return {
      sameSite: 'None',
      secure: true,
      partitioned: true,
    };
  }

  return {
    sameSite: 'Lax',
    secure: shouldUseSecureCookies(request),
    partitioned: false,
  };
}

export function createSessionCookieHeader(token: string, request: CookieRequestLike): string {
  const policy = getSessionCookiePolicy(request);
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    'HttpOnly',
    `SameSite=${policy.sameSite}`,
  ];

  if (policy.secure) {
    parts.push('Secure');
  }

  if (policy.partitioned) {
    parts.push('Partitioned');
  }

  return parts.join('; ');
}

export function clearSessionCookieHeader(request: CookieRequestLike): string {
  const policy = getSessionCookiePolicy(request);
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    `SameSite=${policy.sameSite}`,
  ];

  if (policy.secure) {
    parts.push('Secure');
  }

  if (policy.partitioned) {
    parts.push('Partitioned');
  }

  return parts.join('; ');
}
