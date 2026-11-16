# Limitations and Pending Scientific Work

*Last updated: 2026-11-16.*

## What the website publishes

The application displays three single-date Frequency A HHHH backscatter previews (June 16, June 28, and October 14, 2026), acquisition metadata, and a visual two-date overlay. The previews are exploratory display products. No difference raster, change statistic, flooding estimate, or environmental conclusion is published.

## Data provenance and product maturity

- The raw CMR UMM-G records for the three selected granules were parsed. Their granule concept IDs and `GranuleUR` values match the corresponding project granule records.
- Each record identifies `NISAR_L2_GCOV_PROVISIONAL_V1`, Version 1. The exported CMR spatial-footprint GeoJSON for each scene matches its UMM-G spatial boundary.
- These checks establish catalogue provenance and footprint-record consistency; they do not approve an AOI or a date pair.
- The June 16 granule begins at `2026-06-16T23:44:48Z`, close to the general June 17, 2026 Provisional-collection start date in ASF guidance. Its collection association is documented from its individual UMM-G record; do not infer collection membership from the filename token alone.
- The `P05023` release token is a product release identifier, not proof that a granule has passed all project-specific QA checks.
- Do not propagate a collection concept ID from one granule to another without verifying the corresponding raw record.

## GCOV quality and source-value limitations

- The GCOV `mask` semantics were reviewed against the NISAR L2 GCOV Product Specification, Revision F. Full-scene distributions of `mask`, `inputDataExceptionMask`, and `numberOfLooks` were inspected.
- `mask` and `inputDataExceptionMask` are separate quality-related layers with different meanings. Neither is applied to the public previews.
- No approved mask policy, QA policy, exception policy, or minimum `numberOfLooks` threshold exists.
- Nine candidate upstream QA sidecars previously inspected (three QA_REPORT, three QA_STATS, and three QA_SUMMARY) contained HTML responses, not valid PDF, HDF5, or CSV content. They are not valid producer QA evidence.
- ASF sidecar enumeration/recovery has not been executed in the latest reported attempt, so the availability of valid upstream sidecars remains unknown.
- The local `nisarqa` workflow has not been run.
- Full-scene scans of the three Stage 2 HHHH rasters found zero finite zero values, zero finite negative values, and zero positive/negative infinities. NaN/NoData samples remain. The influence of source NaN/NoData samples on average-resampled preview pixels has not been independently quantified.

## Acquisition and comparison limitations

- June 16 has Forecast orbit/pointing fidelity; June 28 and October 14 have Near Real-Time fidelity. Pairs including June 16 require additional scrutiny.
- The intervals are 12 days, 108 days, and 120 days. Longer temporal separation does not establish a specific event.
- Matching grid dimensions, CRS, track, frame, and direction do not by themselves prove radiometric or scientific compatibility.
- No pair has been approved. All three pair statuses remain `PENDING`.
- The earlier 528,206,772-pixel common-core result applies to the full shared grid, not an approved AOI or approved QA policy. It is diagnostic only.
- The October 14 Stage 2 HHHH export was reported pixel-identical to the separate `real_gcov_geotiff` export over 1,115,964,864 pixels. This equivalence has not been established for June 16 or June 28.

## Display limitations

- Previews are downsampled from 10 m source data to 1800 × 1773 pixels (roughly 190 m per pixel) in Web Mercator and stretched to 8-bit grayscale. Fine detail and the full dynamic range are not preserved.
- The shared stretch (approximately −25.94 to −4.44 dB) is a visualization choice, not a physical threshold.
- The preview workflow average-resamples linear power before dB conversion. No product QA mask is applied.
- The image bounds are the envelope of the projected raster grid, not an official acquisition footprint.
- The preview transparency pattern does not constitute an approved common-valid-pixel mask.

## Study-area limitations

- No authoritative Chagres–Gatún boundary has been selected and approved.
- The MiAmbiente candidate area figures in the diagnostic map and the reported union area have not yet been reconciled from source features, filters, geometry operations, CRS, and area calculations.
- The PMCC 1998 candidate contains five invalid source geometries. A repaired derivative, if produced, must be documented separately from the original source geometries.
- The dashed rectangle on the website is a provisional raster viewing extent, not a watershed, administrative boundary, acquisition footprint, or approved study area.

## Environmental interpretation

A backscatter difference, even a large one, is not proof of flooding, water-level change, inundation, or deforestation without independent supporting evidence. Radar response also depends on moisture, surface roughness, vegetation structure, geometry, orbit quality, processing, and speckle. The application is an observation and visual-exploration tool, not an event-attribution system.
