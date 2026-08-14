## [1.1.2] - 2026-08-13

### Fixed
- Fixed TickTick API requests failing in the userscript due to Content Security Policy (CSP) restrictions.
- Replaced privileged external requests with `GM_xmlhttpRequest()` in the userscript runtime.
- Added centralized request helper for external API communication.

### Improved
- Improved compatibility with websites that restrict cross-origin requests.
- Defuddle extraction and TickTick API calls now use userscript permissions correctly.

### Known limitations
- Generated bookmarklets still use browser `fetch()` directly.
- Bookmarklets may continue to fail on websites with restrictive CSP policies.
- Bookmarklets remain standalone and do not depend on the userscript.
