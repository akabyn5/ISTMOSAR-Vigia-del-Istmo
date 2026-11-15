# Known defects and unfinished functions (handover)

*Maryfer Higuera · 2026-11-15*

## Not finished / pending
- Raw CMR UMM-G records and catalogue URLs (fields marked `PENDING` in `scenes.json`).
- Stage 4 readiness review (MH-02): all three pairs are PENDING; no approval has been given.
- Approved AOI / official footprint: none. No watershed polygon is drawn.
- Visual verification of the three PNGs on the live site.
- Swipe comparison (optional) not implemented; the comparison uses crossfade.
- Mobile/desktop testing on real devices (Tomás tests on his phone).

## Items to confirm with José
1. Averaging was applied to linear power before dB conversion (see `SCIENTIFIC_METHOD.md`).
2. GeoTIFF path mismatch between `georeferencing_validation_report.json` and `preview_metadata.json`.
3. The three PNGs in `assets/maps/` are the ones from `preview_metadata.json` (sizes 1,598,989 / 1,758,399 / 1,784,029 bytes).
4. The metadata `.txt` and validation `.json` files contain local paths (`C:\Users\josep\...`). Decide before committing them as evidence.

## Text in files owned by José that is now out of date (not edited by Maryfer)
- `index.html`: hero note "raster previews are still in progress"; section text "previews will appear here after they are generated"; stat "1 interactive map / basemap enabled"; `aria-label` of the map; about section "Raster previews will be added only after...". (`map.js` already replaces the "BASEMAP ONLY" tag and map footer at run time.)
- `README.md` "Current release status" and feature list; `docs/USER_GUIDE.md` ("basemap only").
- `app.js` panel text says "Preview available" when a preview exists; that is accurate for "generated", not "approved".

## Behaviour notes
- The map and the comparison need HTTP(S) (`py -m http.server`), not `file://`.
- If a PNG is missing the map shows an in-map message naming the missing file.
- About half of every preview is transparent by design (swath shape inside the rectangular grid).
