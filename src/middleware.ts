import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Fetch session from better-auth API endpoint
  // This avoids importing Node-specific libraries (like MongoDB) in the Edge runtime
  const response = await fetch(new URL('/api/auth/get-session', request.url), {
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  });
  
  if (!response.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await response.json();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Pass the user ID down to the route handler to avoid fetching the session again
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.user.id);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/dump/:path*', '/api/tags/:path*'],
};
