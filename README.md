# Perspective

A static personal LinkedIn performance app backed by a bound Google Apps Script and Google Sheets. Blue light/dark themes, phone capture and editing, local screenshot OCR, deterministic hook suggestions and creator insights. No LLM API or LinkedIn scraping.

## Run and test

Serve the repository root over HTTP, for example `python3 -m http.server 8767`. Run `npm test` with a current Node runtime. `/tests/ocr.html` runs synthetic light/dark OCR fixtures in the browser; screenshots stay on-device. Real LinkedIn screenshot layout and physical iPhone verification remain part of acceptance.

## Backend setup

1. Back up the bound Apps Script source/version and preserve the original Posts sheet.
2. Replace Code.gs with `apps-script/Code.gs`. Run `migrationPreview`, inspect the source row count, then run `migrateLegacy`. This creates versioned data tabs and never modifies Posts. Re-running migration skips imported post IDs.
3. Public access is retained at the owner’s request for usability testing. To enable private access later, set a cryptographically random private `PERSPECTIVE_ACCESS_KEY` in Apps Script Project settings → Script properties. Never put it in this repository. Existing deployment runs as owner; when configured, the application key gates all v2 reads and writes.
4. Update the existing web-app deployment to a new version. Keep its deployment URL; if it changes, update `src/api.js` with the public endpoint only. GET exposes health only. Old unauthenticated clients must upgrade.
5. Deploy frontend files through the existing GitHub Pages setup and preserve the custom domain. If enabled later, enter the key in app Settings on each trusted device. Persistent storage is opt-in and readable by same-origin scripts. Disconnect removes key, drafts and cached data; pending writes must be resolved first.

The original data tab is retained as a rollback source. V2 tables use id/revision/JSON records to avoid schema position errors and formula injection. OperationsV2 records prepared/committed changes for retry recovery and correction history. Do not modify JSON rows manually while clients are editing.

## Rollback

Restore the previously deployed Apps Script version and previous frontend commit together. Preserve all V2 tabs; restoring an old version does not merge new V2 writes into legacy Posts. Export V2 data first if returning permanently to the old app. Never delete backups during rollback.

## Scope and limits

One update per post is sufficient. Extra observations are optional and never added together as independent counts. Around-24-hour analysis requires known publication and capture times. Imported timestamps are logging times, not proof of capture age. Missing fields remain null; imported zero ambiguity is labelled.

OCR uses pinned Tesseract.js 6.0.1 and core 6.0.0, downloaded on demand from jsDelivr. Recognition runs on the device; image bytes are not uploaded. Cold OCR needs network, and phone memory/speed vary. Unsupported or ambiguous screenshots require manual correction. The parser supports explicit counts, links, hook/date edits and clear commands, not unrestricted language. No save occurs until review.

The installed app retains the root URL. The service worker avoids forced updates during active use; reopening after closing existing instances activates the waiting worker. Offline writes are queued and retried while the app is open; no background-sync guarantee on iOS.
