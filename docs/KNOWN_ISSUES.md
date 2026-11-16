# Known defects and unfinished functions (handover)

*Maryfer Higuera · updated 2026-11-15 · Phase C (interface) reported complete by José; Phase D (scientific acceptance) in progress.*

## Resolved (reported by José)
- Preview averaging order: linear power before dB (confirmed); no non-positive source values.
- October 14 GeoTIFF path question: the two exports are pixel-identical.
- Public site checked on desktop and mobile; all three previews load and match their metadata.

## Pending scientific acceptance (Phase D)
- CMR UMM-G records: lookup URLs and local evidence files exist; record-to-granule validation pending. Status stays PENDING.
- Stage 4 evidence (QA reports, statistics, summaries, footprints, AOI candidates) located locally; not reviewed.
- AOI: no approved geometry. The dashed rectangle is a provisional raster extent, not a watershed.
- Equivalence of the June 16 and June 28 Stage 2 exports with their validated exports.
- `mask` / `inputDataExceptionMask` policy and common-valid-pixel rule.
- All three date pairs are PENDING; the comparison is visual only.
- Product maturity of collection `NISAR_L2_GCOV_PROVISIONAL_V1` to be confirmed.

## Not implemented
- Curtain/swipe comparison (optional; crossfade is used).

## Text in files owned by José that may still be out of date
- `index.html`: hero note ("raster previews are still in progress"), the "basemap enabled" statistic, Radar Explorer description, About section about future previews.
- `README.md` and `docs/USER_GUIDE.md`: "basemap only / no previews".
- These need José's decision or permission before Maryfer edits them.

## Behaviour notes
- The map needs HTTP(S), not `file://`.
- If a PNG is missing, the map shows a message with the missing file name.
- About half of each preview is transparent by design (swath shape inside the rectangular grid).
- The local metadata/validation reports contain local Windows paths; decide before publishing them.
