# Implementation Plan - Native Scheduling

## Phase 1: Inngest Function Update
### Function Logic
- [ ] Modify `lib/inngest/functions/process-scheduled-post.ts` to include `step.sleepUntil` at the start of the function.
- [ ] Ensure the function checks the post status *after* waking up to handle cancellations.

## Phase 2: API Integration
### Schedule Endpoint
- [ ] Modify `app/api/posts/schedule/route.ts` to trigger `inngest.send()` with the `post/scheduled.process` event immediately after successful DB update.

## Phase 3: Cleanup & Verification
### Cleanup
- [ ] Deprecate/Remove `app/api/cron/process-scheduled-posts/route.ts`.
- [ ] Remove `PostService.processScheduledPosts()` method if no longer used.

### Verification
- [ ] Verify a scheduled post is sent to Inngest.
- [ ] Verify Inngest waits until the scheduled time.
- [ ] Verify post is published correctly.
- [ ] Verify cancelled post (status changed during wait) is not published.
