# Data Provenance

*Last updated: 2026-11-16. Machine-readable scene catalogue: `assets/data/scenes.json`.*

## 1. Selected observations

Product family: NASA–ISRO NISAR L-band Level-2 GCOV (Geocoded Polarimetric Covariance). The selected acquisitions use Frequency A, polarization code `DHDH`, acquisition mode `4005`, relative track 040, descending direction, frame 084, and producer release token `P05023`.

| Acquisition | Cycle | Granule concept ID | Orbit/pointing fidelity | Granule start (UTC) |
|---|---:|---|---|---|
| 2026-06-16 | 023 | `G4250187623-ASF` | Forecast | `2026-06-16T23:44:48Z` |
| 2026-06-28 | 024 | `G4240958164-ASF` | Near Real-Time | `2026-06-28T23:44:46Z` |
| 2026-10-14 | 033 | `G4371433684-ASF` | Near Real-Time | `2026-10-14T23:44:44Z` |

The full granule names are retained in `assets/data/scenes.json` and in the local Phase D evidence package.

## 2. CMR UMM-G verification

The latest local audit reports the following checks as completed for all three granules:

1. The raw CMR UMM-G JSON record was retrieved and parsed.
2. The record's granule concept ID matched the concept ID associated with the local scene record.
3. The record's `GranuleUR` matched the corresponding full granule identifier used by the project.
4. The collection reference in each record identified `NISAR_L2_GCOV_PROVISIONAL_V1`, Version 1.
5. The exported CMR spatial-footprint GeoJSON for each acquisition matched the spatial boundary in its corresponding UMM-G record.

This verifies catalogue-record linkage and consistency between the exported footprint and its source UMM-G boundary. It does **not** establish that the footprint covers an approved study area, that two scenes are scientifically compatible, or that any environmental change has occurred.

The individual granule lookup URLs are:

- June 16: https://cmr.earthdata.nasa.gov/search/granules.umm_json?concept_id=G4250187623-ASF
- June 28: https://cmr.earthdata.nasa.gov/search/granules.umm_json?concept_id=G4240958164-ASF
- October 14: https://cmr.earthdata.nasa.gov/search/granules.umm_json?concept_id=G4371433684-ASF

### Collection concept ID handling

The collection short name and Version 1 are recorded as matched from the corresponding raw granule records. The existing repository draft carried `C2854338529-ASF` as a collection concept ID from an earlier extracted summary. That value is intentionally **not copied to all three scene records** in the updated public manifest. Populate a collection concept ID per scene only after verifying the corresponding raw UMM-G/collection reference. A shared collection name is not a reason to infer an unverified identifier.

### June 16 date-boundary note

The June 16 granule starts at `2026-06-16T23:44:48Z`. ASF availability guidance describes the general start of the Provisional collection as June 17, 2026. This is a date-boundary case. The project's collection-membership statement is based on the individual raw UMM-G record, not an inference from the filename's `P05023` token or from the general availability date. Preserve the exact UTC acquisition timestamp when documenting this scene.

## 3. Product and acquisition identifiers

- Product: `L2 GCOV`.
- Frequency: `A`.
- Polarization code: `DHDH` (the selected HHHH and HVHV diagonal terms are present).
- Relative track: `040`.
- Frame: `084`.
- Acquisition mode: `4005`.
- Direction: descending.
- Producer release token / CRID: `P05023`.
- June 16 orbit/pointing fidelity: Forecast (`F`).
- June 28 and October 14 orbit/pointing fidelity: Near Real-Time (`N`).

Acquisition mode, relative track, direction, frame, and orbit-fidelity tokens are read from the granule naming convention and project records. Do not imply that each was independently obtained from HDF5 attributes unless the corresponding metadata record demonstrates it.

## 4. Spatial footprint evidence versus study area

Three CMR spatial-extent GeoJSON exports were compared with the spatial boundaries in the corresponding UMM-G records. The local audit reports a match for each granule.

These are acquisition-footprint/provenance checks. They are distinct from the following unresolved decisions:

- No authoritative study-area geometry has been selected and approved.
- The legacy PMCC 1998 candidate contains five invalid source geometries; any repaired candidate must be stored and described separately from the original dataset.
- The MiAmbiente HydroBASINS area values shown in the review map and the reported union area have not yet been reconciled by tracing source features, geometry operations, CRS, and area calculation methods.
- `footprintApprovedForStudyArea` remains `false` for every scene.

The dashed outline on the website is the envelope of the common raster grid. It is not a CMR footprint, watershed, administrative boundary, or approved study area.

## 5. Raster grid and preview data lineage

The three Stage 2 exports report a common grid:

- CRS: `EPSG:32617` (WGS 84 / UTM zone 17N).
- Dimensions: 33,768 × 33,048 pixels.
- Pixel spacing: 10 m.
- Affine transform: `[10, 0, 514800, 0, -10, 1145520]`.
- Measurement displayed: Frequency A HHHH gamma-zero linear power.

The public PNG previews were produced from Stage 2 HHHH GeoTIFFs by average-resampling linear power to a display grid, converting positive resampled values with `10·log10`, applying a shared grayscale stretch, and exporting transparent PNGs. The averaging occurs before the dB conversion. Quality masks were not applied. The previews are exploratory display products, not accepted analysis rasters.

A full-scene scan of the three Stage 2 HHHH rasters reported zero finite zero values, zero finite negative values, and zero positive/negative infinities. NaN/NoData samples remain. The influence of source NaN/NoData samples on average-resampled preview pixels has not been independently quantified.

The October 14 Stage 2 HHHH export was reported pixel-identical to a separate `real_gcov_geotiff` export over 1,115,964,864 pixels, with matching grid metadata and NaN-aware exact equality. This equivalence result applies to October 14 only; it must not be generalized to June 16 or June 28.

## 6. QA evidence status

The nine candidate upstream QA sidecars previously inspected (three QA_REPORT, three QA_STATS, and three QA_SUMMARY files) were HTML responses rather than valid PDF, HDF5, and CSV products. They failed expected file-signature checks and are not valid upstream QA evidence.

The GCOV Product Specification, Revision F, has been reviewed for the meaning of the GCOV `mask` and `inputDataExceptionMask` layers. Full-scene distributions of `mask`, `inputDataExceptionMask`, and `numberOfLooks` have also been inspected. These reviews do not substitute for valid producer QA evidence or an approved quality policy.

- ASF sidecar enumeration/recovery: **not executed** in the latest reported attempt; availability of valid sidecars remains unknown.
- Local `nisarqa` execution: **not run**.
- QA policy and common-valid-pixel policy: **not approved**.

## 7. References

- NASA–ISRO NISAR mission: https://nisar.jpl.nasa.gov/
- ASF NISAR availability overview: https://nisar-docs.asf.alaska.edu/availability-overview/
- ASF GCOV documentation: https://nisar-docs.asf.alaska.edu/gcov/
- NISAR L2 GCOV Product Specification, Revision F: https://cumulus.asf.earthdatacloud.nasa.gov/PUBLIC/DATA/NISAR/NISAR_D-102274_RevF_NASA_SDS_Product_Specification_L2_GCOV_w-esigs.pdf
- ASF NISAR Cookbook: https://asfopensarlab.github.io/NISAR_Cookbook/gcov-intro/
- NASA CMR: https://cmr.earthdata.nasa.gov/
