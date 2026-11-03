# Perspective v2 release

- Studio layout with Focus-inspired blue light/dark themes.
- Global period picker; primary, around-24-hour and latest measurement bases.
- Searchable posts and phone editing; optional later observations.
- Screenshot-plus-link capture with local OCR and explicit review.
- Rule-based hook/topic suggestions and supported correction commands.
- Median/category insights with sample counts and supporting-post views.
- Google Sheets migration, revision checks, correction history, idempotent writes and interrupted-write recovery.
- Local draft storage, visible offline queue, export, archive/restore, and PWA shell caching.

## Verified

38 original records migrated, with the original Posts tab preserved. Original and migrated impression sums reconcile to 8,016. Legacy local dates were reconciled against the Sheet timezone. Capture times remain unverified, and legacy zero ambiguity is labelled.

Parser, hook, date, metric, authentication-when-enabled, public-access, revision, retry and interrupted-write tests pass. Browser synthetic light/dark screenshots extract all seven metrics correctly. Real connected create and correction flows were tested with a disposable verification record, then that record was archived. Live overview has no horizontal overflow at 320, 390, 430, 768, 1024 and 1440px.

Backend version 3 uses the existing Apps Script deployment URL. Frontend is on the existing GitHub Pages/custom-domain setup. Public access is retained at the owner's explicit request; the private key remains optional for later.

## Usability checks still needed on the physical phone

Open the existing installed app after closing it fully. Test Photos selection using one of your actual LinkedIn screenshots, the date picker, editing an entry, and light/dark appearance. OCR was tested with synthetic fixtures; LinkedIn layout variations and actual device speed can require manual corrections. No physical iPhone testing has been performed in this run.

OCR engine/core/language assets currently load on demand from pinned CDN URLs. Images are processed locally and not uploaded. The initial OCR load needs a connection. The command box supports explicit patterns, not arbitrary conversation.

## Follow-up polish

User posting targets, crop/rotate tools, and full multi-column customization are not included in this release. Desktop metric selection, publication-time buckets and per-1,000 useful-engagement views are included. Current screens support the principal capture/edit/analysis workflow. Imported ambiguous zeros do not contribute to precision-sensitive interaction-rate cards until corrected/confirmed.

## Capture fixes — 2 November

Regression-tested against the owner's actual iPhone examples (private files excluded from Git): 110 impressions, 75 reached, 1 reaction, and zeros for comments/reposts/saves/sends. OCR now handles spaced digits and trailing navigation glyphs, reads content screenshots into post text, and runs hook/topic rules on that text. New records require an opening/title so blank entries cannot silently become Untitled.

New capture timing defaults to Now at review; old draft timestamps are discarded. Existing observation times remain intact during corrections. Earlier and Unknown are explicit choices. Phone fields use one column with constrained native date/time inputs; the floating Save bar was removed, and post actions wrap without squeezing words into narrow columns. Frontend module URLs are versioned together to prevent mixed cached module versions during an installed-app update.

## 3 November — article capture reliability

- Match complete OCR metric labels so email sends cannot conflict with LinkedIn sends. Store email sends, article views/open rate and post-attributed profile activity separately.
- Keep all readable fields when one field conflicts; leave only the disputed field blank with a review message. Preserve OCR-filled drafts and explicit earlier observation times.
- Strip newsletter header noise from captured post text, correct common OCR I/AI artifacts and suggest a problem/mistake hook for a broken-result opening.
- Reproduce with the three supplied iPhone screenshots: 109 impressions, 62 reached, 5 reactions, 57 article views, 133 email sends, 26% email open rate, and confirmed zeros for other shown metrics.
- Backend deployment version 4 retains the same URL and access setting.
