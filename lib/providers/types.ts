/**
 * The one interface every social channel implements, so `post-service.ts` never grows another branch.
 *
 * Spec: blueprint/specs/03-provider-registry.md
 */

export type PlatformName = 'instagram' | 'facebook' | 'twitter' | 'linkedin';

export type PublishFailureKind = 'auth' | 'content' | 'transient';

export type PublishOutcome =
  | { status: 'published'; platformPostId: string; url?: string }
  | { status: 'pending'; pendingData: string }
  | { status: 'failed'; kind: PublishFailureKind; message: string };

export interface PublishInput {
  /** OAuth access token, already decrypted by the caller. */
  accessToken: string;
  /** Platform-side account/page id from the connected account. */
  accountId: string;
  content: {
    text: string;
    /**
     * An absolute http(s) URL, or null. The caller runs `resolvePostableMediaUrl` before this point,
     * so a provider can never be handed a relative path or a filesystem path.
     */
    mediaUrl: string | null;
    link?: string;
  };
}

export interface SocialProvider {
  identifier: PlatformName;
  displayName: string;
  scopes: string[];
  maxLength: number;
  requiresMedia: boolean;
  publish(input: PublishInput): Promise<PublishOutcome>;
  classifyError?(raw: unknown): PublishFailureKind;
}

/**
 * Every existing poster collapses a platform error into a plain `Error` whose message is the platform's
 * `error.error.message` (Graph) or `error.detail` (Twitter); the HTTP status and error subcode are gone
 * before we see them. Auth vs content is therefore not knowable here, so this returns the honest
 * default — transient — instead of guessing. Upgrade when the posters surface the raw payload.
 */
export function classifyTransientError(_raw: unknown): PublishFailureKind {
  return 'transient';
}
