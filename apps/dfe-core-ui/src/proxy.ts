import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: [
    /*
     * Match all paths under (auth) except static files and api routes.
     * (auth) group renders at / so we protect the root and its children.
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
