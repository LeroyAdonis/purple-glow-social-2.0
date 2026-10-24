/**
 * Model-agnostic AI provider.
 *
 * One chat completion, many backends. The provider is chosen purely from
 * environment variables so we can move from a free self-hosted router to a
 * paid one without touching code:
 *
 *   AI_PROVIDER  'freellmapi' (default) | 'openrouter' | 'nim' | 'gemini'
 *   AI_BASE_URL  OpenAI-compatible root, e.g. http://127.0.0.1:3901/v1
 *   AI_API_KEY   bearer token for that router (GEMINI_API_KEY also accepted
 *                for the 'gemini' provider so switching back keeps working)
 *   AI_MODEL     model id sent to the backend
 *
 * Every provider except 'gemini' speaks plain OpenAI chat completions.
 * There is no silent fallback to another provider: a misconfigured provider
 * throws loudly instead of quietly succeeding against the wrong backend.
 */

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatCompleteOptions = {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
};

const PROVIDERS = ['freellmapi', 'openrouter', 'nim', 'gemini'] as const;
type Provider = (typeof PROVIDERS)[number];

const DEFAULT_PROVIDER: Provider = 'freellmapi';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

/** Total attempts = 1 + MAX_RETRIES. */
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 30_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Error for an HTTP failure. Carries the status and a snippet of the body,
 * but NEVER the API key - callers may log or rethrow these freely.
 */
class ProviderHttpError extends Error {
  constructor(
    public readonly status: number,
    bodySnippet: string
  ) {
    super(`AI provider request failed with HTTP ${status}: ${bodySnippet}`);
    this.name = 'ProviderHttpError';
  }
}

function readProvider(): Provider {
  const raw = (process.env.AI_PROVIDER || DEFAULT_PROVIDER).toLowerCase().trim();
  if (!(PROVIDERS as readonly string[]).includes(raw)) {
    throw new Error(
      `Unknown AI_PROVIDER "${raw}". Supported providers: ${PROVIDERS.join(', ')}`
    );
  }
  return raw as Provider;
}

/** Require a variable, naming exactly which one is missing. Never logs values. */
function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `AI provider configuration error: environment variable ${name} is not set`
    );
  }
  return value;
}

/** Strip any accidental key material out of text destined for an error message. */
function redact(text: string): string {
  const secrets = [process.env.AI_API_KEY, process.env.GEMINI_API_KEY].filter(
    (s): s is string => Boolean(s && s.length >= 4)
  );
  let out = text;
  for (const secret of secrets) {
    out = out.split(secret).join('[redacted]');
  }
  return out;
}

/** Retry transient failures only: network errors, timeouts, HTTP 429 and 5xx. */
function isRetryable(error: unknown): boolean {
  if (error instanceof ProviderHttpError) {
    return error.status === 429 || error.status >= 500;
  }
  if (error instanceof Error) {
    // fetch network failures ("fetch failed") and AbortController timeouts
    return error.name === 'TypeError' || error.name === 'AbortError';
  }
  return false;
}

async function withRetries<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === MAX_RETRIES) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastError;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function throwHttpError(response: Response): Promise<never> {
  let body = '';
  try {
    body = await response.text();
  } catch {
    body = '';
  }
  throw new ProviderHttpError(response.status, redact(body.slice(0, 200)));
}

/** OpenAI-compatible backend: POST {AI_BASE_URL}/chat/completions. */
async function chatCompleteOpenAI(
  messages: ChatMessage[],
  opts: ChatCompleteOptions
): Promise<string> {
  const provider = readProvider();
  const baseUrl = requireEnv('AI_BASE_URL').replace(/\/+$/, '');
  const apiKey = requireEnv('AI_API_KEY');
  const model = requireEnv('AI_MODEL');

  const body: Record<string, unknown> = {
    model,
    messages,
  };
  if (typeof opts.temperature === 'number') body.temperature = opts.temperature;
  if (typeof opts.maxTokens === 'number') body.max_tokens = opts.maxTokens;
  if (opts.json) body.response_format = { type: 'json_object' };

  const response = await withRetries(async () => {
    let res: Response;
    try {
      res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          // Helps router-side routing/observability, harmless elsewhere.
          'X-Provider': provider,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`AI provider request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      }
      throw new Error(`AI provider network error: ${redact(String(error))}`);
    }
    if (!res.ok) {
      await throwHttpError(res);
    }
    return res;
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('AI provider returned a non-JSON response body');
  }

  const content =
    (data as { choices?: Array<{ message?: { content?: string } }> })
      .choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('AI provider response missing choices[0].message.content');
  }
  return content;
}

/** Google Gemini backend: keeps the existing generativelanguage endpoint. */
async function chatCompleteGemini(
  messages: ChatMessage[],
  opts: ChatCompleteOptions
): Promise<string> {
  // Prefer AI_API_KEY, but keep GEMINI_API_KEY working so switching back is
  // a config change, not a code change.
  const apiKey = process.env.AI_API_KEY?.trim() || requireEnv('GEMINI_API_KEY');

  const systemText = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const generationConfig: Record<string, unknown> = {};
  if (typeof opts.temperature === 'number') generationConfig.temperature = opts.temperature;
  if (typeof opts.maxTokens === 'number') generationConfig.maxOutputTokens = opts.maxTokens;
  if (opts.json) generationConfig.responseMimeType = 'application/json';

  const payload: Record<string, unknown> = { contents, generationConfig };
  if (systemText) {
    payload.systemInstruction = { parts: [{ text: systemText }] };
  }

  const response = await withRetries(async () => {
    let res: Response;
    try {
      res = await fetchWithTimeout(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`AI provider request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      }
      throw new Error(`AI provider network error: ${redact(String(error))}`);
    }
    if (!res.ok) {
      await throwHttpError(res);
    }
    return res;
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('AI provider returned a non-JSON response body');
  }

  const parts = (
    data as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    }
  ).candidates?.[0]?.content?.parts;
  const text = parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text) {
    throw new Error('AI provider response missing candidates[0].content.parts text');
  }
  return text;
}

/**
 * Perform one chat completion against the configured provider.
 *
 * @throws if the provider is unknown, if required env vars are missing, or if
 *         the backend fails after retries. Error messages never contain the
 *         API key.
 */
export async function chatComplete(
  messages: ChatMessage[],
  opts: ChatCompleteOptions = {}
): Promise<string> {
  const provider = readProvider();
  if (provider === 'gemini') {
    return chatCompleteGemini(messages, opts);
  }
  return chatCompleteOpenAI(messages, opts);
}
