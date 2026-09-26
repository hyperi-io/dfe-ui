import 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    expiresIn?: number;
    roles?: string[];
    passwordChangeRequired?: boolean;
  }

  interface Session {
    error?: 'AccessTokenExpired';
    accessTokenExpiresAt?: number;
    passwordChangeRequired?: boolean;
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
    passwordChangeRequired?: boolean;
  }
}
