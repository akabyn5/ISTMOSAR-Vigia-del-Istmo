# Known defects and pending work

*Updated 2026-11-15 for the Phase C release.*

## Not finished / pending
- Raw CMR UMM-G records and catalogue URLs (fields marked `PENDING` in `scenes.json`), including the collection and product maturity of each scene.
- Stage 4 readiness review: all three pairs are PENDING; no approval has been given (see `STAGE4_READINESS.md`).
- Approved AOI / official footprint: none. No watershed polygon is drawn; the dashed rectangle is a provisional raster extent.
- Visual verification of the three PNGs against the basemap on the live site (`rasterPreviewVisuallyVerified` stays `false` until done).
- Source zero/negative-value inspection of the Stage 2 rasters, and the Stage 2 versus `real_gcov_geotiff` pixel comparison (see `DATA_PROVENANCE.md`, section 7).
- Testing on real phones and tablets: automated viewport tests are not a substitute.
- Swipe comparison (optional) is not implemented; the comparison uses crossfade.

## Items to keep in mind when handling the evidence files
- The metadata `.txt` and validation `.json` files kept outside the repository contain personal local file-system paths. Remove or rewrite those paths before any such file is committed or quoted publicly.
- The three PNGs in `assets/maps/` must stay identical to the ones listed in `preview_metadata.json` (sizes 1,598,989 / 1,758,399 / 1,784,029 bytes).

## Behaviour notes
- The map and the comparison need HTTP(S) (`py -m http.server`), not `file://`.
- If a PNG is missing, the map and the comparison show a message naming the missing file.
- About half of every preview is transparent by design (swath shape inside the rectangular grid).
- When the radar layer is hidden with the checkbox, changing the scene keeps it hidden until it is shown again.
