# 08 · Content and voice

The product's voice is the reason it exists: it writes like a South African small-business owner talks, not
like software. The interface has to sound the same, or the product feels like a machine pretending.

## Voice in one line

**Warm, direct, competent. Speaks plainly, never performs.**

- Speaks to **you**, not "users". "Your posts", not "the user's content".
- Short sentences. If a sentence needs re-reading, it is rewritten.
- South African English spelling: *organise, colour, centre, programme*. Rand amounts as **R299**, not ZAR 299.00.
- Times in **SAST** and 24-hour — "17:30", not "5:30 PM". South Africa does not observe daylight saving, so
  the offset is fixed and never needs explaining.
- No jargon where a plain word exists: "write a post", not "generate content assets".

## Honesty rules — these override tone

These exist because the previous version shipped invented testimonials and a "5,000+ SA businesses" figure on
its front page.

1. **Never claim a number we cannot show.** No user counts, no "trusted by", no ratings, no testimonials from
   people who do not exist. If a customer count is zero, the site says nothing about customers.
2. **Never claim a capability that is not built and working.** "Coming soon" is honest; a fake feature is not.
3. **Never use "AI-powered" as the description.** Say what it does: "writes your post in isiZulu so you can read
   it before it goes out".
4. **Name the limit.** "Free plan: 10 credits, 5 scheduled posts" beats "generous free tier".
5. **Errors state the cause and the fix.** "Instagram rejected the image because it is 9MB and the limit is
   8MB. Resize it, or pick another photo." Never "Something went wrong."
6. **Do not blame the user.** "That email is already registered — sign in instead, or reset your password."

## Microcopy patterns

| Situation | Say | Not |
| --- | --- | --- |
| Primary action | "Approve and schedule" | "Submit" |
| Empty state | "No posts scheduled yet. Pick a day and Posta will draft three." | "No data available" |
| Confirmation | "Published to Instagram at 17:30." | "Success!" |
| Failure | "Facebook rejected the post: the caption is 640 characters and the limit is 632." | "Error occurred" |
| Credit running out | "3 credits left — enough for one more post." | "Low balance" |
| Language choice | "isiZulu" (its own name), "Afrikaans", "Setswana" | "Zulu (South Africa)" |
| Destructive | "Delete this post?" + what is lost + "Delete post" button | "Are you sure?" |
| Loading | "Writing your post in isiZulu…" | "Loading…" |

## Language names — use the language's own name

English · Afrikaans · isiZulu · isiXhosa · Sesotho · Setswana · Sepedi · Xitsonga · siSwati · Tshivenda ·
isiNdebele

Never "Zulu" alone in a language picker — the picker is for the person who speaks it. (English and Afrikaans
are already the native names; the other nine use their own.)

## Writing for translation and generation

Posta generates copy in 11 languages, so our own strings must be translation-safe:

- No concatenated sentences ("Your post is " + status + " to " + platform). Full sentences with placeholders.
- No text baked into images.
- No idioms that will not survive translation in the UI chrome — save the personality for marketing, keep the
  app copy literal and clear.
- Every label must be tested with its **longest** translation, not English. IsiZulu and Sesotho are routinely
  30–50% longer.
- Do not uppercase localised strings programmatically (`text-transform`); uppercase is for our own English meta
  labels only.

## What the app never says

- "Oops", "Whoops", "Uh-oh" — a professional tool does not giggle at a failure.
- "Simply", "just", "easily" — if it were easy the user would not be reading the message.
- "Please" more than once in a message.
- Emoji in UI copy. (Marketing may use one, in the Instagram captions, and only where the brand's extracted
  voice allows it.)
- Marketing superlatives: "revolutionary", "game-changing", "seamless", "effortless", "unlock".

## Tone shifts by surface

| Surface | Tone |
| --- | --- |
| Marketing page | Confident, warm, a little local ("Sharp sharp"). One idea per section. |
| Onboarding | Encouraging, concrete, three steps maximum. |
| The app | Quiet and factual. It is a tool at work, not a host. |
| Errors | Calm, specific, and always with a next step. |
| Billing and legal | Plain, exact, no personality. Money is not a place for wit. |
| Email | Same as the app, plus a single clear action. |
