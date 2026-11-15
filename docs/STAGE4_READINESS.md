# Stage 4 Scientific Readiness Summary (MH-02)

*Prepared by Maryfer Higuera for José Peñalba · 2026-11-15 · DRAFT based only on the evidence listed in section 1. José makes the final approval decision.*

## Bottom line

**No pair is GO. All three pairs are PENDING.** No evidence found so far makes any pair incompatible (so none is NO-GO), but the checks that would justify approval (AOI, official footprint, mask interpretation, QA reports) have not been completed. Identical grid size and alignment are not approval.

| Priority | Pair | Interval | Status | Main reason |
|---|---|---:|---|---|
| 1 | June 16 – June 28 | 12 days | **PENDING** | Forecast vs Near Real-Time orbit fidelity; AOI, footprint, masks, QA open |
| 2 | June 28 – October 14 | 108 days | **PENDING** | Same fidelity (both Near Real-Time), but AOI, footprint, masks, QA open |
| 3 | June 16 – October 14 | 120 days | **PENDING** | Forecast vs Near Real-Time orbit fidelity; AOI, footprint, masks, QA open |

## 1. Evidence examined

- HDF5 metadata inspections of the three granules (`June16/June28/October14_metadata.txt`).
- `georeferencing_validation_report.json` (October 14 export only).
- `preview_metadata.json` (preview generation, 2026-11-15).
- José's Phase B handoff message (CMR, grid, AOI status).
- Repository files `scenes.json` and `study_area.json`.

**Not seen:** QA_REPORT, QA_STATS, QA_SUMMARY, any AOI approval record, any official CMR footprint, raw UMM-G records, validation reports for the June exports.

## 2. Review items

| Item | Finding | State |
|---|---|---|
| Current AOI approval status | No approved boundary vector. `study_area.json`: `geometryApproved: false`. The map shows only a provisional raster extent. | **Not approved** |
| Official footprint evidence | None. The WGS84 bounds are the envelope of the raster grid, not a CMR footprint. UMM-G records not recovered. | **Missing** |
| GCOV `mask` and `inputDataExceptionMask` | Both exist in all three files (uint8, same shape as the grid). Their values and meaning were not inspected, and they were **not applied** to the previews. | **Interpretation pending** |
| QA_REPORT / QA_STATS / QA_SUMMARY | Not provided and not examined. The metadata inspections covered only the Frequency A grid. | **Not reviewed** |
| Scientific compatibility of dates | See section 3. | **Compatible on metadata; unconfirmed on quality** |
| Pair approval | None given. | **Pending** |

## 3. Compatibility of the candidate dates

**Matching (from metadata and filenames):** relative track 040, descending, frame 084, mode 4005, polarization code DHDH, Frequency A with HHHH and HVHV, same Composite Release ID (CRID) P05023, same CRS (EPSG:32617), same 33,768 × 33,048 grid at 10 m, same gamma-zero linear power convention.

**Differences that matter:**
- **June 16 is Forecast orbit fidelity**; June 28 and October 14 are Near Real-Time. Both pairs that include June 16 need scrutiny of geolocation and radiometric consistency. This is a caution, not proof of a problem.
- Cycle gaps are consistent with a 12-day repeat (23→24 = 12 days; 24→33 = 108 days; 23→33 = 120 days).
- All three dates fall in Panama's usual rainy season, so a seasonal contrast may be limited. This is general context, not evidence from the data.
- The only CMR collection reference (October 14) is `NISAR_L2_GCOV_PROVISIONAL_V1`, and that association awaits official CMR verification. The maturity of the product must be confirmed for each scene; June 16 predates the stated start of the PROVISIONAL collection.

## 4. What would move a pair to GO

1. José approves an AOI (or an explicit decision to use the raster extent as a screening area).
2. An official footprint (from the raw UMM-G or ASF) is checked against that area.
3. The meaning of `mask` and `inputDataExceptionMask` is read from the product documentation and a mask policy is chosen.
4. QA_REPORT / QA_STATS / QA_SUMMARY are located and reviewed, including for the Forecast scene.
5. A common-valid-pixel mask (valid in both dates) is defined.
6. Export validation is confirmed for the June scenes and the GeoTIFF path mismatch is resolved (see `docs/DATA_PROVENANCE.md`).
7. The preview averaging order is confirmed (reported by the project owner's script inspection; the effect of zero/negative source values is still to be inspected).

## 5. Recommended order

Review the **June 28 – October 14** pair first for readiness: both scenes are Near Real-Time, so the fidelity question is avoided. Keep **June 16 – June 28** as the first-priority pair for the demonstration only if the Forecast-fidelity check passes. Do not display a difference map, change statistics or flooding estimate for any pair until it is approved.

## 6. Evidence still needed from José

- QA_REPORT, QA_STATS, QA_SUMMARY for the three scenes (or their location in the HDF5 files).
- Any AOI decision and its source.
- Raw UMM-G JSON records.
- Validation reports for the June GeoTIFF exports.
