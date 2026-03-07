import 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    roles?: string[];
  }

  interface Session {
    user: User & {
      accessToken?: string;
      roles?: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    roles?: string[];
  }
}
