# Stage 4 Scientific Readiness Summary (MH-02)

*Maryfer Higuera for José Peñalba · updated 2026-11-15 · DRAFT. José makes the final approval decision.*

## Bottom line

**No pair is GO. All three pairs remain PENDING.** The evidence that was missing in the first draft (QA reports, footprints, AOI candidates) has now been **located locally by José, but has not been reviewed**. Nothing found so far makes a pair incompatible (so none is NO-GO), and nothing yet justifies approval. Identical grid size and alignment are not approval.

| Priority | Pair | Interval | Status | Main reason |
|---|---|---:|---|---|
| 1 | June 16 – June 28 | 12 days | **PENDING** | Forecast vs Near Real-Time fidelity; QA, footprint, AOI, masks not reviewed |
| 2 | June 28 – October 14 | 108 days | **PENDING** | Same fidelity (both Near Real-Time); QA, footprint, AOI, masks not reviewed |
| 3 | June 16 – October 14 | 120 days | **PENDING** | Forecast vs Near Real-Time fidelity; QA, footprint, AOI, masks not reviewed |

## 1. Review items

| Item | Finding | State |
|---|---|---|
| AOI approval | Two candidates exist (legacy PMCC 1998 subwatersheds; MiAmbiente HydroBASINS). None selected or approved. `study_area.json`: `geometryApproved: false`. | **Not approved** |
| Official footprint | Three CMR spatial-extent GeoJSON and three footprint KML located locally. Not yet compared with the raster grid. CMR record-to-granule match not validated. | **Located, not reviewed** |
| `mask` / `inputDataExceptionMask` | Present in all three files; not applied to the previews; meaning and policy not decided. | **Interpretation pending** |
| QA_REPORT / QA_STATS / QA_SUMMARY | Three PDF reports, three HDF5 statistics and three CSV summaries located locally. Availability is now established; **validity and content are not reviewed**. | **Located, not reviewed** |
| Date compatibility | See section 2. | **Compatible on metadata; quality unconfirmed** |
| Pair approval | None given. | **Pending** |

## 2. Compatibility of the candidate dates

**Matching:** relative track 040, descending, frame 084, mode 4005, DHDH, Frequency A (HHHH, HVHV), release token P05023, EPSG:32617, 33,768 × 33,048 grid at 10 m, gamma-zero linear power.

**Differences that matter:**
- June 16 is **Forecast** orbit fidelity; June 28 and October 14 are **Near Real-Time**. Pairs including June 16 need extra scrutiny of geolocation and radiometry (a caution, not a finding).
- All three dates fall in Panama's usual rainy season, so seasonal contrast may be limited (general context, not data evidence).
- The only collection reference seen (October 14) is `NISAR_L2_GCOV_PROVISIONAL_V1`; product maturity must be confirmed.

## 3. Raster and processing checks completed (reported by José)

- Preview processing order confirmed: average resampling of linear power, then dB.
- No zero, negative or infinite source values in the three Stage 2 HHHH rasters.
- October 14: Stage 2 and `real_gcov_geotiff` rasters are pixel-identical. **Not established for June 16 and June 28.**

## 4. What moves a pair to GO

1. Review the three QA reports, statistics and summaries (including the Forecast scene).
2. Compare each CMR footprint with the raster grid and validate each CMR record against its granule.
3. José selects and approves the study-area geometry.
4. Read the meaning of `mask` and `inputDataExceptionMask`; choose a mask policy and a common-valid-pixel rule.
5. Confirm equivalence of the June Stage 2 exports with their validated exports.

## 5. Recommended order

Review **June 28 – October 14** first for readiness: both scenes are Near Real-Time. Keep **June 16 – June 28** as the first-priority demonstration pair only if the Forecast-fidelity and QA checks pass. Show no difference map, change statistics or flooding estimate for any pair until approved.

## 6. Still needed to finish this review

The QA PDFs, QA summary CSVs, the three CMR GeoJSON files and the AOI candidate files. They are not in this repository; this summary does not describe their contents.
