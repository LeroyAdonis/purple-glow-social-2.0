import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = 'nodejs';

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request) => {
    const url = new URL(req.url);
    console.log('[Auth API] GET request:', {
        path: url.pathname,
        search: url.search,
        timestamp: new Date().toISOString()
    });
    try {
        const response = await handlers.GET(req);
        console.log('[Auth API] GET response status:', response.status);
        return response;
    } catch (error) {
        console.error('[Auth API] GET error:', error);
        throw error;
    }
};

export const POST = async (req: Request) => {
    const url = new URL(req.url);
    console.log('[Auth API] POST request:', {
        path: url.pathname,
        timestamp: new Date().toISOString()
    });
    try {
        const response = await handlers.POST(req);
        console.log('[Auth API] POST response status:', response.status);
        // Log set-cookie header to debug cookie issues
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            console.log('[Auth API] Set-Cookie header present:', setCookie.substring(0, 100) + '...');
        } else {
            console.log('[Auth API] No Set-Cookie header in response');
        }
        return response;
    } catch (error) {
        console.error('[Auth API] POST error:', error);
        throw error;
    }
};
