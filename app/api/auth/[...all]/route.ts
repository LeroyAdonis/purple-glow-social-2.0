import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Explicitly set runtime to nodejs (required for Better-auth)
export const runtime = 'nodejs';

// Export the auth handlers using Next.js adapter
export const { GET, POST } = toNextJsHandler(auth);
