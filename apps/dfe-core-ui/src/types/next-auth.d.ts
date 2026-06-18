import 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    expiresIn?: number;
    roles?: string[];
  }

  interface Session {
    error?: 'AccessTokenExpired';
    user: User & {
      accessToken?: string;
      roles?: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    error?: 'AccessTokenExpired';
    roles?: string[];
  }
}
