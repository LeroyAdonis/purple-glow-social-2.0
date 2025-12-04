import { createAuthClient } from "better-auth/react";

// Use relative URL for API calls - this ensures requests go to the same origin
// better-auth client will use the current origin when baseURL is empty/relative
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
