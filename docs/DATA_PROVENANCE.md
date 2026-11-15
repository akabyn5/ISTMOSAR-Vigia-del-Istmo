# Data Provenance

*Last updated: 2026-11-15. Machine-readable version: `assets/data/scenes.json`.*

## 1. Observations

Product: NISAR L-band Level-2 GCOV (Geocoded Polarimetric Covariance), producer release token `P05023`, Frequency A, polarization code `DHDH`, acquisition mode `4005`, relative track 040, descending, frame 084.

### 2026-06-16 — Cycle 023 — Forecast orbit fidelity
- Granule: `NISAR_L2_PR_GCOV_023_040_D_084_4005_DHDH_A_20260616T234448_20260616T234520_P05023_F_F_J_001`
- Acquisition: 2026-06-16 23:44:48 – 23:45:20 UTC
- CMR granule concept ID (previously associated, unverified): `G4250187623-ASF`
- HDF5 size: 4,877,975,552 bytes (4.543 GiB)

### 2026-06-28 — Cycle 024 — Near Real-Time orbit fidelity
- Granule: `NISAR_L2_PR_GCOV_024_040_D_084_4005_DHDH_A_20260628T234446_20260628T234520_P05023_N_F_J_001`
- Acquisition: 2026-06-28 23:44:46 – 23:45:20 UTC
- CMR granule concept ID (previously associated, unverified): `G4240958164-ASF`
- HDF5 size: 5,100,273,664 bytes (4.750 GiB)

### 2026-10-14 — Cycle 033 — Near Real-Time orbit fidelity
- Granule: `NISAR_L2_PR_GCOV_033_040_D_084_4005_DHDH_A_20261014T234444_20261014T234517_P05023_N_F_J_001`
- Acquisition: 2026-10-14 23:44:44 – 23:45:17 UTC
- CMR granule concept ID (previously associated, unverified): `G4371433684-ASF`
- CMR collection (from an earlier extracted summary; raw record not inspected): `NISAR_L2_GCOV_PROVISIONAL_V1`, `C2854338529-ASF`
- HDF5 size: 4,991,221,760 bytes (4.648 GiB)

Orbit fidelity is read from the granule-name token (`F` = Forecast, `N` = Near Real-Time) and the project task assignment. Acquisition mode, track, frame and direction come from the filename and the project handoff, not from HDF5 attributes.

## 2. Source references

- NASA–ISRO NISAR mission: https://nisar.jpl.nasa.gov/
- ASF NISAR Cookbook, GCOV introduction: https://asfopensarlab.github.io/NISAR_Cookbook/gcov-intro/
- Alaska Satellite Facility (ASF DAAC), where the granules were obtained (CMR provider `ASF`): https://asf.alaska.edu/
- Full CMR UMM-G JSON records: **PENDING RAW JSON VERIFICATION** (a retrieval/parsing issue; it does not show the granules are absent).

## 3. Processing history

| Step | What was done | Evidence |
|---|---|---|
| 1. Acquisition | HDF5 granules downloaded to the project's local machine (not stored in this repository). | Granule IDs and sizes above |
| 2. Metadata inspection | Read `/science/LSAR/GCOV/grids/frequencyA`: HHHH and HVHV present; CRS EPSG:32617; 33,768 × 33,048 px; 10 m; coordinate arrays and dataset shapes consistent. No raster values modified. | `June16/June28/October14_metadata.txt` |
| 3. GeoTIFF export | Frequency A HHHH written as Float32 GeoTIFF in linear gamma-zero power, NaN = NoData, same grid (affine `[10, 0, 514800, 0, -10, 1145520]`). | `georeferencing_validation_report.json` (October 14 export: dimensions, affine, CRS, NaN NoData, sampled values, pixel-centre coordinates all passed); `preview_metadata.json` lists the Stage 2 GeoTIFF of every scene |
| 4. Preview generation | `10·log10`, reprojection and average downsampling to EPSG:3857 at 1800 × 1773 px, grayscale with a shared stretch of −25.938 to −4.439 dB, transparent for NoData / non-finite / non-positive; QA masks **not** applied. Generated 2026-11-15 05:42:28 UTC. | `preview_metadata.json` |

The validation report states: *single-acquisition backscatter exports only; no temporal change detection or multi-date metrics were calculated.*

## 4. Raster grid (all three scenes)

EPSG:32617; projected bounds W 514800 / S 815040 / E 852480 / N 1145520 m. WGS84 envelope used for the overlays: W −80.865895°, S 7.362125°, E −77.781933°, N 10.362723°. **These describe the raster grid, not an official acquisition footprint and not an approved study area.**

## 5. Preview images

| Scene | File | Size | Valid / transparent preview px |
|---|---|---|---|
| 2026-06-16 | `assets/maps/june16_preview.png` | 1,598,989 bytes | 1,594,131 / 1,597,269 |
| 2026-06-28 | `assets/maps/june28_preview.png` | 1,758,399 bytes | 1,691,432 / 1,499,968 |
| 2026-10-14 | `assets/maps/october14_preview.png` | 1,784,029 bytes | 1,643,234 / 1,548,166 |

All previews share the same 1800 × 1773 EPSG:3857 grid and the same overlay bounds. They are exploratory display products.

## 6. Current verification state

| Scene | Metadata verified | Raster exported | Preview generated | Preview visually verified | Approved for comparison |
|---|---|---|---|---|---|
| 2026-06-16 | Yes (HDF5) | Yes | Yes | No | No |
| 2026-06-28 | Yes (HDF5) | Yes | Yes | No | No |
| 2026-10-14 | Yes (HDF5) | Yes (validated) | Yes | No | No |

These are different states. Pair status (June 16–28, June 28–Oct 14, June 16–Oct 14): all **PENDING**.

## 7. Open verification items

1. Raw CMR UMM-G records and ASF URLs for all three granules.
2. The October 14 validation report lists the GeoTIFF as `.../real_gcov_geotiff/.../NISAR_frequencyA_HHHH_linear.tif`, while `preview_metadata.json` lists `.../stage_2_geotiff_exports/.../frequencyA_HHHH.tif`. Confirm they are the same data or re-validate the Stage 2 files; no validation report was seen for the June scenes' exports.
3. Order of averaging vs dB conversion in the preview script.
4. Visual check that each PNG is correctly placed on the basemap.
5. Official footprint and approved AOI.
