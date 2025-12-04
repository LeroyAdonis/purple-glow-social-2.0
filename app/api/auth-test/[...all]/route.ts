console.log('[Auth Test Route] File loaded');
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = 'nodejs';

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request, props: any) => {
    console.log(`[Auth Test Debug] GET request to: ${req.url}`);
    return handlers.GET(req);
};

export const POST = async (req: Request, props: any) => {
    console.log(`[Auth Test Debug] POST request to: ${req.url}`);
    return handlers.POST(req);
};
