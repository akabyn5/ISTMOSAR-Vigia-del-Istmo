# ISTMOSAR — Phase D Evidence Reconciliation

*Date: 2026-11-16*  
*Purpose: reconcile the November 15 Phase C/Stage 4 handover with the later local audit evidence. This document does not grant scientific acceptance.*

## Executive decision

**Formal quantitative scientific status: `PHASE_D_SCIENTIFIC_ACCEPTANCE_BLOCKED`.**

The project has completed additional provenance and raster-diagnostic checks since the November 15 draft. Those checks correct several outdated statements in that draft and in the public repository. They do not resolve AOI approval, valid upstream QA evidence, an approved quality policy, pairwise approval, or quantitative change validation.

The public application may continue to publish the observation explorer and visual-only comparison. Quantitative change detection must remain pending/disabled.

## Evidence updates

### CMR provenance and scene footprints

- Three raw CMR UMM-G records were retrieved and parsed.
- The granule concept ID and `GranuleUR` in each record match the corresponding local project granule record.
- The records identify `NISAR_L2_GCOV_PROVISIONAL_V1`, Version 1.
- Each exported CMR spatial-footprint GeoJSON matches the corresponding UMM-G spatial boundary.
- These checks verify catalogue-record linkage and footprint-record consistency only. They do not approve an AOI or any pair.
- The June 16 acquisition begins at `2026-06-16T23:44:48Z`, close to the general June 17 collection-start date in ASF availability guidance. Its collection membership is supported by its individual UMM-G record; the date should be documented as a boundary case rather than inferred from the filename token.
- The earlier repository draft carried `C2854338529-ASF` as a collection concept ID from an extracted summary. This reconciliation does not copy that identifier across all scenes. Populate collection concept IDs only after checking each corresponding raw record.

### GCOV quality diagnostics

- The applicable NISAR L2 GCOV Product Specification, Revision F, was reviewed for the GCOV `mask` semantics.
- The GCOV `mask` and `inputDataExceptionMask` are distinct layers and must not be conflated.
- Full-scene distributions of `mask`, `inputDataExceptionMask`, and `numberOfLooks` were inspected.
- No universal `numberOfLooks` threshold or accepted quality policy has been selected.
- The three Stage 2 HHHH full-scene scans found zero finite zero values, zero finite negative values, and zero positive/negative infinities. NaN/NoData samples remain; the effect of source NaN/NoData samples during average resampling has not been independently quantified.
- The nine candidate upstream QA sidecars previously inspected (three QA_REPORT, three QA_STATS, three QA_SUMMARY) contained HTML responses, not valid PDF, HDF5, or CSV content. They cannot support producer QA acceptance.
- ASF sidecar enumeration/recovery was not executed in the latest reported attempt. Thus valid sidecar availability remains unknown; zero retrieved by an unexecuted attempt is not evidence of unavailability.
- Local `nisarqa` was not run.

## D-01 through D-06 status

| Work package | Technical status | Scientific approval | Remaining blocker |
|---|---|---|---|
| D-01 — AOI and footprints | PARTIAL | PENDING_HUMAN_APPROVAL | CMR granule/footprint record consistency is checked, but no authoritative AOI is selected or approved; MiAmbiente and PMCC discrepancies remain. |
| D-02 — GCOV quality | PARTIAL | BLOCKED | Revision F mask semantics and full-scene distributions reviewed; valid upstream QA sidecars not available in the inspected files; ASF recovery not run; local `nisarqa` not run; policy not approved. |
| D-03 — Common-valid pixels | PARTIAL | BLOCKED | The earlier 528,206,772 count is full-grid diagnostic only; no approved AOI/QA mask or AOI-specific valid-pixel statistics exist. |
| D-04 — Pairwise requirements | PARTIAL | PENDING_HUMAN_APPROVAL | Three pairs evaluated provisionally; none approved or enabled. |
| D-05 — Difference raster/statistics | BLOCKED | NOT_APPROVED | No difference raster or quantitative statistics generated; preflight gates remain closed. |
| D-06 — Limitations/publication | PARTIAL | Conservative exploratory route only | Observation explorer and visual comparison can be published with explicit limitations; no quantitative environmental claims. |

## AOI issues still open

1. The MiAmbiente review map shows candidate areas of 2,832.4 km² and 4,475.8 km², while the audit report records a 10,537.335446 km² union. Reconcile the source feature IDs, filters, geometry unions, overlap/deduplication, CRS, area calculation, and any repair operations before selecting an AOI.
2. The PMCC 1998 candidate contains five invalid source geometries. Do not describe a repaired derivative as the original geometry. If a repair is justified, preserve the source, document the repair operation, and quantify area/geometry changes.
3. Neither AOI candidate is approved. The raster viewing rectangle is not an AOI.

## Pairwise comparison status

| Pair | Interval | Fidelity | Status |
|---|---:|---|---|
| June 16 → June 28 | 12 days | Forecast → Near Real-Time | PENDING |
| June 28 → October 14 | 108 days | Near Real-Time → Near Real-Time | PENDING |
| June 16 → October 14 | 120 days | Forecast → Near Real-Time | PENDING |

Matching grid metadata and consistent CMR footprint records are insufficient to authorize change detection. No pair is GO.

## Difference products

`NOT_GENERATED_BLOCKED`

No quantitative difference raster, pairwise change statistics, accepted common-valid mask, or environmental estimate is present. Do not use the display PNGs as inputs to quantitative analysis.

## Publication decision

Allowed public scope:

- Exploratory NISAR observation explorer.
- Visual comparison of single-date HHHH previews.
- Acquisition metadata and provenance with the distinctions stated above.
- Explicit scientific limitations and a visible pending/blocked quantitative-analysis status.

Not allowed as current project claims:

- Validated flood detection or flood extent.
- Quantitative change map or accepted change statistics.
- Approved watershed/study-area coverage.
- Scientifically approved comparison pair.

Recommended status strings:

```text
observationExplorer = AVAILABLE
visualComparison = AVAILABLE
quantitativeChangeDetection = PENDING
quantitativeScientificAcceptance = BLOCKED
```

## Files updated by this reconciliation

- `index.html`: corrected CMR, source-value, and quality-status explanations.
- `assets/data/scenes.json`: updated provenance/diagnostic status while retaining false approval flags and PENDING pair statuses.
- `README.md`: current project status and provenance summary.
- `docs/DATA_PROVENANCE.md`: raw UMM-G and footprint-record status, collection/date caveats, and evidence lineage.
- `docs/SCIENTIFIC_METHOD.md`: current technical checks and unresolved quality/acceptance policy.
- `docs/LIMITATIONS.md`: corrected provenance and QA limitations.
- `docs/KNOWN_ISSUES.md`: completed checks separated from outstanding blockers.
- `docs/PHASE_D_EVIDENCE_RECONCILIATION_2026-11-16.md`: this dated reconciliation.

`docs/STAGE4_READINESS.md` is intentionally preserved unchanged as the November 15 historical draft. This reconciliation supersedes outdated statements for current status reporting but does not erase the original review history.

## Final verdict

`PHASE_D_BLOCKED`

Provenance and diagnostic review have advanced. Scientific acceptance for quantitative change detection has not been achieved. Retain all preflight protections and approval flags.
