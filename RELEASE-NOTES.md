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
