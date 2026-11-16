# Scientific Method — ISTMOSAR

*Last updated: 2026-11-16. This document separates completed inspections from pending scientific decisions.*

## 0. Current scientific status

| Work item | Technical state | Scientific acceptance |
|---|---|---|
| HDF5 metadata inspection (grid, CRS, datasets, units) | Completed for the three granules, as reported in the local audit | Does not establish comparison approval |
| CMR UMM-G record linkage | Raw records parsed; concept IDs and `GranuleUR` values matched | Provenance check only |
| CMR footprint consistency | Exported CMR footprint GeoJSONs matched to corresponding UMM-G spatial boundaries | Does not approve an AOI |
| Stage 2 HHHH full-scene value scan | No finite zero/negative or infinite values found; NaN/NoData remains | Does not validate QA or NoData resampling behavior |
| GCOV `mask` interpretation | Reviewed against Product Specification Revision F | Quality policy not approved |
| `inputDataExceptionMask` interpretation | Kept distinct from the GCOV `mask`; distributions inspected | Exception-handling policy not approved |
| `numberOfLooks` distribution | Inspected | No threshold selected or approved |
| Upstream QA sidecars | Nine candidate files previously inspected were HTML, not valid PDF/HDF5/CSV | Valid producer QA evidence remains unavailable in the inspected package |
| ASF QA-sidecar recovery | Not executed in the latest reported attempt | Availability remains unknown |
| Local `nisarqa` | Not run | No locally generated QA report exists |
| AOI and pairwise valid-pixel policy | Not approved | D-01/D-03 remain incomplete |
| Difference raster/statistics | Not generated | D-05 blocked |

## 1. What NISAR measures

NISAR is a joint NASA–ISRO Earth-observation radar mission. Synthetic aperture radar (SAR) is an active microwave technique: the instrument transmits radar pulses and records energy scattered back toward it. Backscatter is influenced by surface roughness, moisture, vegetation structure, acquisition geometry, and other factors. A SAR image is not an optical photograph.

L-band can be useful for studying vegetation and surface-water-related radar responses, but those properties do not identify a particular pixel as water or prove inundation.

## 2. GCOV measurement used by this project

Level-2 GCOV (Geocoded Polarimetric Covariance) provides geocoded polarimetric covariance measurements on a map grid. The selected scenes contain Frequency A HHHH and HVHV. This application displays HHHH only.

The Stage 2 grid used by the previews is reported as `EPSG:32617`, 33,768 × 33,048 pixels, 10 m spacing, Float32, with gamma-zero linear power values. Supporting layers include `mask`, `inputDataExceptionMask`, and `numberOfLooks`.

HHHH and HVHV are distinct covariance terms and must not be treated as interchangeable measurements.

## 3. GCOV quality layers — do not conflate their meanings

The applicable NISAR L2 GCOV Product Specification, Revision F, was reviewed for the mask definitions. The project records the following interpretation for the GCOV `mask` layer:

- `0`: invalid or partially focused sample.
- `1` through `5`: valid, fully focused subswath membership codes.
- `255`: fill value outside the RSLC image bounds.

`inputDataExceptionMask` is a separate layer and does not have the same semantics as the GCOV `mask`. It is an exception/condition bitmask; it must be interpreted using its own product-specification definition and not substituted for the GCOV `mask`.

`numberOfLooks` is a per-sample adaptive multi-looking quantity. It varies with factors such as topography and radar geometry. This project has not invented or adopted a universal minimum `numberOfLooks` threshold.

The full-scene distributions of `mask`, `inputDataExceptionMask`, and `numberOfLooks` were inspected in the local audit. These inspections do not constitute an approved QA policy. Neither quality layer is applied to the published previews.

Controlling reference: [NISAR L2 GCOV Product Specification, Revision F](https://cumulus.asf.earthdatacloud.nasa.gov/PUBLIC/DATA/NISAR/NISAR_D-102274_RevF_NASA_SDS_Product_Specification_L2_GCOV_w-esigs.pdf).

## 4. Upstream QA status

Nine candidate upstream QA sidecars were previously inspected: three QA_REPORT, three QA_STATS, and three QA_SUMMARY files. The inspected files contained HTML responses rather than valid PDF, HDF5, or CSV content and failed expected file-signature checks. They cannot support granule-level QA acceptance.

The latest Claude-assisted ASF recovery attempt did not execute an ASF search or download. Therefore, the count of valid QA sidecars retrieved by that attempt is zero, but this is **not evidence that ASF has no such files**. Sidecar availability for these granules remains unknown until a real authenticated inventory/search is completed.

The local `nisarqa` workflow has not been executed. A code/documentation review is not an executed QA run, and locally generated QA would be separate evidence from original producer QA.

## 5. Preview generation

The published previews are display products generated from the Stage 2 Frequency A HHHH GeoTIFFs:

1. Read gamma-zero linear power.
2. Reproject and average-resample linear power to the display grid (EPSG:3857, 1800 × 1773 pixels).
3. Convert positive destination values to dB using `10·log10(power)`.
4. Apply a shared grayscale stretch of approximately −25.94 to −4.44 dB.
5. Export transparent PNGs.

The averaging is performed before the dB conversion. The product quality masks are not applied. The previews are approximately 190 m per pixel and are not substitutes for the 10 m source rasters.

A full-scene scan of the three Stage 2 HHHH rasters found zero finite zero values, zero finite negative values, and zero positive/negative infinities. NaN/NoData samples remain. Their treatment and spatial influence during average resampling have not been independently quantified.

## 6. Decibels

The displayed power conversion is:

`γ⁰_dB = 10 · log10(γ⁰_linear)`

The factor is 10 because the input is power, not amplitude. Values that are not positive finite values do not have a valid logarithmic dB representation and are displayed transparently according to the preview workflow.

## 7. Common-valid pixels — not yet approved

A future comparison policy must define the valid mask for each acquisition and the intersection used for each date pair. Conceptually:

`V_i = F_i ∩ Q_i ∩ P_i`

where `F_i` is the official scene footprint, `Q_i` is the approved quality policy, and `P_i` is the finite-positive HHHH power condition.

For a pair:

`M_(A,B) = AOI ∩ V_A ∩ V_B`

The AOI, quality policy, and common-valid-pixel policy have not been approved. An earlier diagnostic reported 528,206,772 pixels in the three-scene common core-valid intersection across the full shared raster grid. That count is not AOI-restricted, does not apply an approved QA policy, and is not a scientific acceptance result.

## 8. Pairwise comparisons

| Pair | Interval | Fidelity | Status |
|---|---:|---|---|
| June 16 → June 28 | 12 days | Forecast → Near Real-Time | PENDING |
| June 28 → October 14 | 108 days | Near Real-Time → Near Real-Time | PENDING |
| June 16 → October 14 | 120 days | Forecast → Near Real-Time | PENDING |

Identical grids, matching track/frame identifiers, and footprint-record consistency are not sufficient by themselves to approve a pair. AOI coverage, QA, acquisition fidelity, valid pixels, and the scientific question must be evaluated separately.

## 9. Difference calculation — not performed

No quantitative difference has been calculated or published. If a pair is eventually approved, a candidate dB difference is:

`Δ_dB = 10·log10(P_later) − 10·log10(P_earlier)`

It must be calculated from full-resolution Stage 2 power rasters on an approved pair-specific common-valid mask, not from the downsampled PNG previews. D-01 through D-04 approval and a successful preflight are prerequisites.

## 10. Interpretation limits

A difference in radar backscatter does not, by itself, prove flooding, inundation, water-level change, deforestation, or another environmental event. Soil and vegetation moisture, surface roughness, vegetation structure, acquisition geometry, orbit/pointing fidelity, processing differences, and speckle can also change the measurement. Environmental attribution requires independent evidence and a validated method.
