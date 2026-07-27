import { setupServer } from 'msw/node';

// No default handler: each perspective test registers /auth/me for the specific
// role under test via server.use(authMeHandlerForRole(identity)) before render,
// so an accidental unhandled request is an error rather than a silent admin.
export const server = setupServer();
