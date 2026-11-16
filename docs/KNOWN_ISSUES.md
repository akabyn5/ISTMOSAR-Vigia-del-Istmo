# Known Issues and Pending Work

*Last updated: 2026-11-16. This file supersedes the outdated status statements in the November 15 handover; the dated `STAGE4_READINESS.md` draft remains unchanged as a historical snapshot.*

## Resolved or reviewed (reported in the latest local audit)

- The three raw CMR UMM-G records were retrieved and parsed; each granule concept ID and `GranuleUR` matched the corresponding local granule record.
- The three exported CMR spatial-footprint GeoJSON files matched their corresponding UMM-G spatial boundaries.
- The three records identify the `NISAR_L2_GCOV_PROVISIONAL_V1` collection, Version 1.
- The applicable NISAR GCOV Product Specification, Revision F, was reviewed for GCOV `mask` semantics.
- Full-scene distributions of `mask`, `inputDataExceptionMask`, and `numberOfLooks` were inspected. The two mask layers remain distinct; no policy has been approved.
- Full-scene Stage 2 HHHH scans reported zero finite zero values, zero finite negative values, and zero positive/negative infinities. NaN/NoData samples remain.
- Preview processing order is confirmed: average-resample linear power before converting positive destination values to dB.
- October 14 Stage 2 HHHH and separate `real_gcov_geotiff` exports were reported pixel-identical over 1,115,964,864 pixels. This is not established for June 16 or June 28.
- José reported that all three preview images load and their metadata panels display correctly on desktop and mobile. This is visual/application verification, not scientific approval.

## Pending or blocked scientific acceptance

- **ASF QA-sidecar recovery:** not executed in the latest reported attempt. Valid sidecar availability for the three granules remains unknown.
- **Invalid candidate sidecars:** the nine previously inspected QA_REPORT/QA_STATS/QA_SUMMARY files contained HTML responses and failed expected PDF/HDF5/CSV signature checks. They cannot be used as producer QA evidence.
- **Local NISARQA:** not run. A code review is not a QA execution.
- **AOI selection:** no authoritative study-area geometry is approved. The dashed map rectangle is only the provisional shared raster-grid extent.
- **MiAmbiente area discrepancy:** map values (2,832.4 km² and 4,475.8 km²) and the reported union area (10,537.335446 km²) still require a feature-level and geometry-operation reconciliation.
- **PMCC geometry:** five source geometries were identified as invalid. Any repaired derivative must remain separate and report its repair method and area impact.
- **June Stage 2 equivalence:** pixel-level equivalence with separately validated exports has not been established for June 16 and June 28.
- **QA policy:** no accepted policy for GCOV `mask`, `inputDataExceptionMask`, `numberOfLooks`, NoData handling, or common-valid pixels exists.
- **Pair approval:** June 16 → June 28, June 28 → October 14, and June 16 → October 14 are all `PENDING`.
- **Difference product:** no quantitative difference raster or accepted statistics exist. D-05 remains blocked.

## Application behavior and scope

- The public observation explorer and visual crossfade comparison are available.
- The Change Explorer is visual-only; it does not compute a difference raster or statistics.
- No synthetic example is presented as a real NISAR observation.
- Curtain/swipe comparison is optional and not implemented; crossfade is used.
- The application requires HTTP(S), not `file://`, because the scene catalogue is loaded with `fetch()`.
- Approximately half of each preview may be transparent because the imaged swath does not fill the rectangular raster-grid envelope.

## Release controls

- Preserve `approvedForComparison: false` for all scenes.
- Preserve `footprintApprovedForStudyArea: false` for all scenes.
- Preserve `status: "PENDING"` for all three pairs.
- Do not enable quantitative processing or create difference products until AOI, quality policy, common-valid mask, pair compatibility, and independent product validation are approved.
- Do not commit large source HDF5 files, full-size GeoTIFFs, QA sidecars, credentials, or private local paths.
