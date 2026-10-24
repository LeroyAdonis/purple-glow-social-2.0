import { createAuthClient } from "better-auth/react";

// Use relative URL for API calls - this ensures requests go to the same origin
// better-auth client will use the current origin when baseURL is empty/relative
//
// When the app is served under a sub-path (Next basePath), the auth endpoints move with it: the route
// handler ends up at <basePath>/api/auth/*, while the server-side config still answers on /api/auth
// because Next strips its own prefix before routing. Calling /api/auth from the browser therefore 404s
// on "sign-up/email", so the prefix is passed to the client explicitly. baseURL must stay origin-only:
// better-auth treats a path inside baseURL as the whole base and silently drops basePath.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
  basePath: process.env.NEXT_PUBLIC_AUTH_BASE_PATH || "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
