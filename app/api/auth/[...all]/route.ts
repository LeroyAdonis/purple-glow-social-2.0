import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { logger } from "@/lib/logger";

export const runtime = 'nodejs';

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request) => {
    const url = new URL(req.url);
    logger.auth.info('GET request received', {
        path: url.pathname,
        search: url.search,
        timestamp: new Date().toISOString()
    });
    try {
        const response = await handlers.GET(req);
        logger.auth.debug('GET response', { status: response.status });
        return response;
    } catch (error) {
        logger.auth.error('GET request failed', { error });
        throw error;
    }
};

export const POST = async (req: Request) => {
    const url = new URL(req.url);
    logger.auth.info('POST request received', {
        path: url.pathname,
        timestamp: new Date().toISOString()
    });
    try {
        const response = await handlers.POST(req);
        logger.auth.debug('POST response', { status: response.status });
        // Log set-cookie header to debug cookie issues
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            logger.auth.debug('Set-Cookie header present', { 
                cookiePreview: setCookie.substring(0, 100) + '...' 
            });
        } else {
            logger.auth.warn('No Set-Cookie header in response');
        }
        return response;
    } catch (error) {
        logger.auth.error('POST request failed', { error });
        throw error;
    }
};
