# FEATURE-REGISTRY — one provider interface behind all four channels

**Status:** ready to build · **Ticket:** DIG-59 · **Item:** 1 in `docs/POSTIZ-BUILD-SPECS.md`
**Why before channel five:** every new channel today means another branch inside `post-service.ts`. Wrap
the four we have first and adding Threads becomes an afternoon instead of a refactor.

## The contract (our design, from `docs/POSTIZ-BUILD-SPECS.md` section 1)

```ts
// lib/providers/types.ts
export type PlatformName = 'instagram' | 'facebook' | 'twitter' | 'linkedin';

export type PublishOutcome =
  | { status: 'published'; platformPostId: string; url?: string }
  | { status: 'pending'; pendingData: string }
  | { status: 'failed'; kind: 'auth' | 'content' | 'transient'; message: string };

export interface SocialProvider {
  identifier: PlatformName;
  displayName: string;
  scopes: string[];
  maxLength: number;
  requiresMedia: boolean;
  publish(input: PublishInput): Promise<PublishOutcome>;
  classifyError?(raw: unknown): 'auth' | 'content' | 'transient';
}
```

`lib/providers/registry.ts` exports `getProvider(name)` and `listProviders()`.

## What "done" means

1. **Behaviour is unchanged.** Every existing caller produces the same platform calls, in the same order,
   with the same payloads. This ticket is a seam, not a rewrite — nobody should be able to tell it landed.
2. The four existing posters are wrapped, **not modified**: each provider delegates to the poster classes
   already in `lib/posting/*.ts`. Do not re-implement an API call in a provider.
3. `post-service.ts` resolves a provider from the registry by platform name instead of branching.
4. **The media rule is preserved**: a provider never receives a non-postable image URL. The existing
   `resolvePostableMediaUrl` guard stays the single decision point — call it, do not duplicate it.
5. `classifyError` maps a raw platform error to `auth` / `content` / `transient`. Where the real API error
   shape is not known, return `'transient'` and say so in a comment — a guess presented as fact is worse
   than an honest default.
6. Adding a fifth provider requires **no edit** to `post-service.ts`. Prove that with a test that registers
   a fake provider.

## Tests to write FIRST (RED before implementation)

`lib/providers/registry.test.ts`
- `getProvider('instagram')` and the other three return objects satisfying the contract
- an unknown name throws with the name in the message
- a fake provider registered at test time is returned by the registry

`lib/providers/contract.test.ts`
- every registered provider declares a non-empty `identifier`, `displayName`, `scopes`, and a positive
  `maxLength` — asserted by looping `listProviders()`, so a future fifth provider cannot skip it
- `requiresMedia` is true for instagram and false for the other three

`lib/posting/post-service.test.ts`
- posting to a platform whose provider is missing fails with a typed error naming the platform
- **no provider is ever handed a relative image path** — pass `/generated/x.jpg` and assert the provider
  received an absolute URL (the guard from the media ticket)

## Constraints

- Do not change any poster's payloads. If a poster needs a change to fit the contract, stop and report it
  as an OPEN CALL instead of silently altering the request it sends to a platform.
- Do not touch `.env*`, `posta-serve.sh`, `drizzle/`, `app/api/v1/**`, `lib/media/**`.
- Do not commit. Prove with `npx tsc --noEmit` and `npx vitest run` on your own files.
- No new dependency.
- Finish with a DECISIONS block: INTENT, ACCEPTANCE, DECISIONS, REJECTED, OPEN CALLS, EVIDENCE (real
  commands and real output including the RED run), ACCEPTED RISK.
