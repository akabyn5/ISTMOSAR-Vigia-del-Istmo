# Scientific Method — ISTMOSAR

*Last updated: 2026-11-15. This document describes what has actually been done, and separately what is planned but not yet done.*

## 0. Status at a glance

| Step | State |
|---|---|
| HDF5 metadata inspection of the three GCOV granules (grid, CRS, datasets, units) | Done |
| Frequency A HHHH GeoTIFF export (linear gamma-zero power, NaN as NoData) | Done (reported; validation report seen for 2026-10-14) |
| Display PNG previews (dB, grayscale, shared stretch, EPSG:3857) | Generated (reported in `preview_metadata.json`); counts and sizes match the PNGs in `assets/maps/` |
| Averaging of linear power before the dB conversion | Confirmed by the project owner's inspection of the preview-generation script (the script is not stored in this repository) |
| Effect of zero/negative **source** values on averaged pixels | **Not investigated** — a window-based inspection of the Stage 2 rasters is pending |
| Equivalence of the Stage 2 GeoTIFFs and the separately georeferenced `real_gcov_geotiff` export (October 14) | **Not demonstrated** |
| CMR verification of each granule (collection, product maturity) | **Pending** |
| GCOV `mask` / `inputDataExceptionMask` interpretation | **Not done** — masks were not applied to the previews |
| Study-area (AOI) approval and official footprint check | **Not done** |
| Two-date difference in dB, valid-pixel statistics | **Not done** |
| Any flooding or environmental interpretation | **Not done and not claimed** |

## 1. What is NISAR?

NISAR (NASA–ISRO Synthetic Aperture Radar) is a joint Earth-observation radar mission of NASA and ISRO. It carries an L-band radar (NASA/JPL) and an S-band radar (ISRO). This project uses **L-band only**. The mission repeats its observations on a regular cycle; the cycles used here (023, 024, 033) are consistent with a 12-day repeat (12 days between cycles 023 and 024, 108 days between 024 and 033).

## 2. What does SAR measure?

SAR is an **active microwave** technique. The instrument transmits radar pulses and records the energy scattered back toward it (**backscatter**). It is not a photograph: the brightness depends on surface roughness, moisture, vegetation structure and viewing geometry. SAR works day and night and is largely independent of cloud cover.

## 3. Why is L-band relevant to surface water and vegetation?

L-band has a long wavelength (about 24 cm). Compared with shorter wavelengths it penetrates vegetation canopies more deeply and is more sensitive to larger structural elements (trunks, branches) and to the ground beneath the canopy. Smooth open water typically reflects the signal away from the sensor (low backscatter), whereas inundated vegetation can sometimes return strong signal through double-bounce scattering. These are **reasons the band is useful for such studies, not evidence that any particular pixel is water or flooded forest**.

## 4. What does the GCOV product represent?

Level-2 GCOV (Geocoded Polarimetric Covariance) provides terrain-corrected polarimetric covariance terms on a map grid. In the files used here the grid is `EPSG:32617` (WGS 84 / UTM zone 17N) at 10 m spacing, 33,768 × 33,048 pixels, Float32, with supporting layers (`mask`, `inputDataExceptionMask`, `numberOfLooks`, `rtcGammaToSigmaFactor`).

## 5. Why Frequency A HHHH?

All three granules contain Frequency A with the HHHH and HVHV terms (VVVV and VHVH are not present). **HHHH was chosen as the project's initial comparison measurement** so that the same channel, frequency and convention are used on every date. HVHV is available but is not displayed. This is a project decision, not a statement that HHHH is the best channel for every question.

## 6. What does gamma-zero mean?

Gamma-zero (γ⁰) is a radar backscatter normalization in which the received power is referenced to the area perpendicular to the radar line of sight. This reduces the dependence on local terrain slope and incidence angle compared with a ground-plane normalization. In the HDF5 files the values have unit `1` (dimensionless) and are **linear power**, not dB. The `rtcGammaToSigmaFactor` layer is not applied.

## 7. Why convert power with 10·log10?

Backscatter power spans several orders of magnitude (HHHH values in these files range from about 10⁻⁸ to 10⁴). Decibels compress this range:

`γ⁰_dB = 10 · log10(γ⁰_linear)`

The factor is **10 because these are power values**. The factor 20 is for amplitude and must not be used. Values ≤ 0 or NaN have no dB value; in the previews, resampled values that are NoData, non-finite or non-positive are shown transparent.

## 8. How is the two-date difference calculated?

**Planned, not yet performed.** Once a pair is scientifically approved, the difference would be

`Δ_dB = 10·log10(P_later) − 10·log10(P_earlier) = 10·log10(P_later / P_earlier)`

computed only on pixels that are valid in both dates. **No difference has been calculated or published.** The website's "Change Explorer" overlays two single-date previews and lets the user crossfade between them; this is a visual comparison only.

## 9. How does valid-pixel masking work?

*Done in the previews:* after resampling, destination pixels that are NaN (NoData), non-finite, or ≤ 0 are made transparent. About half of each preview is transparent because the raster grid contains empty corners around the imaged swath. This is a filter on the **resampled** values; it must not be read as saying that every non-positive **source** pixel was masked before the averaging. Whether non-positive source values exist and could influence neighbouring averaged pixels is still to be inspected (see section 12).

*Not done:* the product's `mask` and `inputDataExceptionMask` layers were **not applied** because their interpretation policy has not been approved. A future "common-valid" mask would keep only pixels valid in both dates after that policy is approved.

## 10. Why do backscatter changes not independently prove flooding?

Backscatter changes can come from soil or vegetation moisture, vegetation growth or loss, surface roughness (wind, tillage, harvest), differences in acquisition geometry or orbit quality, processing differences, and speckle noise — in addition to flooding. A change in radar brightness is a **hypothesis generator**. A flood or water-level claim would need independent evidence (e.g. in-situ or gauge records, optical imagery, validated classification).

## 11. Orbit-and-pointing fidelity, CRID and product maturity

- Granule names end `..._<CRID>_<A>_<C>_<LOC>_<counter>`. Following the ASF documentation of the NISAR file-naming convention, the first of those tokens is the **fidelity of the orbit ephemeris and radar pointing** (`F` = Forecast, `N` = Near Real-Time), the second is the **frame coverage** (`F` = Full) and the third is the processing location (`J` = JPL). Confirm against the JPL product specification (D-102274).
- **Orbit and pointing fidelity: Forecast** for 2026-06-16 (token `F`). **Orbit and pointing fidelity: Near Real-Time** for 2026-06-28 and 2026-10-14 (token `N`). The following `F` token in all three names is frame coverage (Full), not fidelity.
- `P05023` is the **CRID (Composite Release ID)**. ASF documents P05023 as the CRID of its PROVISIONAL NISAR products.
- PROVISIONAL products are described by ASF/NASA as calibrated and partially validated, intended for data exploration and process studies; quality may not be optimal and validated reprocessing may supersede them.
- The October 14 record has been associated with the collection `NISAR_L2_GCOV_PROVISIONAL_V1` (`C2854338529-ASF`); this association awaits official CMR verification. The June 16 acquisition predates the stated 2026-06-17 start of the PROVISIONAL collection, so **no collection maturity is assigned to June 16 or June 28** until their official granule/CMR records are checked.

What this supports:

| Use | Status |
|---|---|
| Exploratory visual inspection | Appropriate, with the product maturity disclosed |
| Reproducible preliminary research | Possible if CRID, collection, versions and caveats are recorded |
| Scientifically approved quantitative analysis | Not yet: AOI, footprints, masks, QA evidence and CMR verification are open |
| Operational or authoritative environmental conclusions | Not supported |

## 12. Open checks on the preview processing

1. **Source zero/negative values.** A memory-efficient, window-by-window inspection of each Stage 2 HHHH raster should count NaN, zero, negative, infinite and positive cells and the minimum positive value. If zeros are stored as numbers rather than NaN, an average over a block that includes them lowers the mean. The result must be recorded here before the previews are described as free of this effect.
2. **Stage 2 versus `real_gcov_geotiff` (October 14).** Matching dimensions and CRS are not equivalence. A window-by-window, NaN-aware comparison of dimensions, CRS, affine transform, dtype, NoData and pixel values is needed. No validation report exists for the June exports.
3. Visual check of each PNG against the basemap.

## Display products (how the previews were made)

1. Read the Stage 2 Frequency A HHHH GeoTIFF: gamma-zero **linear power**.
2. Reproject to EPSG:3857 and **average-resample the linear power values** to 1800 × 1773 px.
3. Convert the positive resampled values to dB: `10 · log10(power)`.
4. Apply one grayscale stretch between **−25.94 dB and −4.44 dB** (2nd–98th percentile of all finite positive cells of the three downsampled previews), shared by all scenes.
5. Export a PNG with transparency for NoData, non-finite and non-positive resampled values. Product QA masks are **not** applied.

The order in steps 2–3 (average in linear power, then convert to dB) was confirmed by the project owner's inspection of `generate_istmosar_hhhh_previews.py`. `preview_metadata.json` records "average" and the dB transform but not their order, so this confirmation rests on the script, which is not part of this repository. Previews are **display products and not substitutes for the original measurements.**
