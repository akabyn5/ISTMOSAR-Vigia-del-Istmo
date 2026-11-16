# ISTMOSAR — Vigía del Istmo

**Space Dogs · Advanced Research Projects and International Programs (ARPIP) · NASA Space Apps Challenge 2026**

ISTMOSAR is an exploratory public web application for inspecting selected NASA–ISRO NISAR L-band Level-2 GCOV acquisitions relevant to environmental research in Panama.

> **Current release status:** the application provides three NISAR-derived HHHH backscatter display previews, acquisition metadata, a radar observation explorer, and a visual-only two-date comparison. The previews are not QA-approved scientific results. No study-area boundary, quantitative difference raster, change statistic, flood estimate, or environmental conclusion has been approved or published. **ISTMOSAR is not a validated change-detection system.**

## Public application

- Website: https://akabyn5.github.io/ISTMOSAR-Vigia-del-Istmo/
- Repository: https://github.com/akabyn5/ISTMOSAR-Vigia-del-Istmo

## Current features

- Responsive static single-page application.
- Leaflet map with an OpenStreetMap basemap and three exploratory NISAR HHHH previews.
- Acquisition selector with date, cycle, track, frame, orbit direction, orbit fidelity, frequency, polarization, and CMR granule concept ID.
- Radar preview visibility and opacity controls.
- Visual-only comparison of the three chronological pairs: June 16 → June 28, June 16 → October 14, and June 28 → October 14, 2026.
- Scientific-method, data-provenance, and limitations documentation.

## Data and provenance status

The three selected records are NISAR L-band Level-2 GCOV acquisitions:

| Acquisition | Cycle | Orbit/pointing fidelity | CMR granule concept ID |
|---|---:|---|---|
| 2026-06-16 | 023 | Forecast | `G4250187623-ASF` |
| 2026-06-28 | 024 | Near Real-Time | `G4240958164-ASF` |
| 2026-10-14 | 033 | Near Real-Time | `G4371433684-ASF` |

The latest local Phase D audit reports that the raw CMR UMM-G records were parsed; each granule concept ID and `GranuleUR` matches the corresponding project granule; the records identify `NISAR_L2_GCOV_PROVISIONAL_V1`, Version 1; and each exported CMR spatial-footprint GeoJSON matches its corresponding UMM-G spatial boundary. This verifies catalogue provenance and footprint-record consistency only. It does **not** approve an AOI, a pair, or an environmental interpretation. See [`docs/DATA_PROVENANCE.md`](docs/DATA_PROVENANCE.md).

The June 16 acquisition begins at `2026-06-16T23:44:48Z`, close to the general June 17, 2026 Provisional-collection start date cited in ASF availability guidance. The individual raw UMM-G collection association is the evidence for this scene; collection membership must not be inferred from the filename token alone. The collection concept ID is deliberately not propagated across scene records in the public manifest unless confirmed from each corresponding raw record.

## Scientific and quality status

- The three Stage 2 HHHH rasters were scanned across the full scene. The scan reported zero finite zero values, zero finite negative values, and zero positive/negative infinities. NaN/NoData samples remain; their influence during average resampling has not been independently quantified.
- Preview generation averages linear gamma-zero power before applying `10 · log10` to positive resampled values. It then applies a shared display stretch and exports transparent PNGs. Product QA masks are not applied to the previews.
- GCOV `mask` semantics were reviewed against the NISAR GCOV Product Specification, Revision F. `inputDataExceptionMask` is a distinct layer; it must not be treated as interchangeable with `mask`. Full-scene distributions of `mask`, `inputDataExceptionMask`, and `numberOfLooks` were inspected. No `numberOfLooks` threshold or QA policy has been approved.
- The nine candidate upstream QA sidecars previously inspected were HTML responses, not valid PDF, HDF5, or CSV QA products. ASF sidecar enumeration/recovery has not yet been executed; local `nisarqa` has not been run. The availability of valid upstream QA sidecars therefore remains unknown.
- No authoritative study-area geometry has been selected or approved. The dashed map outline is the envelope of the shared raster grid, not an acquisition footprint or watershed boundary.
- All three date pairs remain `PENDING`. A matching raster grid is not scientific approval.
- No difference raster, quantitative change statistic, or accepted common-valid-pixel mask has been generated.

**Formal status:** `PHASE_D_SCIENTIFIC_ACCEPTANCE_BLOCKED` · Observation explorer: available · Visual comparison: available · Quantitative change detection: pending.

A backscatter difference alone does not prove flooding, inundation, deforestation, or another environmental event. Such interpretations require independent supporting evidence and validated analysis.

## Repository structure

```text
ISTMOSAR-Vigia-del-Istmo/
├── index.html
├── README.md
├── assets/
│   ├── css/styles.css
│   ├── js/
│   ├── data/scenes.json
│   ├── data/study_area.json
│   └── maps/
└── docs/
    ├── DATA_PROVENANCE.md
    ├── SCIENTIFIC_METHOD.md
    ├── LIMITATIONS.md
    ├── KNOWN_ISSUES.md
    ├── STAGE4_READINESS.md
    └── PHASE_D_EVIDENCE_RECONCILIATION_2026-11-16.md
```

## Run locally

From the repository root, start a local static server:

```powershell
py -m http.server 8000
```

Open http://localhost:8000. Do not open `index.html` directly from File Explorer; the scene catalogue is loaded with `fetch()` and requires HTTP(S).

## Deploy with GitHub Pages

1. Push the verified changes to the `main` branch.
2. Confirm the GitHub Actions deployment completes successfully.
3. Open the public Pages URL and test the observation selector, all three preview images, metadata, and visual comparison on desktop and mobile.

## Data handling policy

Do not commit original NISAR HDF5 products, full-size GeoTIFF exports, QA sidecars, credentials, private datasets, or local Python environments. Keep large source data and intermediate processing products in controlled local/private storage. Publish only small previews and supporting metadata that are appropriate for public release. Review `git status` before every commit; `.gitignore` is not a substitute for checking staged files. Do not put personal local file-system paths in public documentation.

## External references

- NASA–ISRO NISAR mission: https://nisar.jpl.nasa.gov/
- ASF NISAR data availability and Provisional products: https://nisar-docs.asf.alaska.edu/availability-overview/
- ASF GCOV documentation: https://nisar-docs.asf.alaska.edu/gcov/
- NISAR L2 GCOV Product Specification, Revision F: https://cumulus.asf.earthdatacloud.nasa.gov/PUBLIC/DATA/NISAR/NISAR_D-102274_RevF_NASA_SDS_Product_Specification_L2_GCOV_w-esigs.pdf
- ASF NISAR Cookbook — GCOV introduction: https://asfopensarlab.github.io/NISAR_Cookbook/gcov-intro/
- NASA CMR: https://cmr.earthdata.nasa.gov/
- Leaflet: https://leafletjs.com/
- OpenStreetMap copyright and attribution: https://www.openstreetmap.org/copyright

## License

A project-wide software license has not yet been selected. Do not assume that the source code, project identity, or scientific data are licensed for unrestricted reuse. Add a license only after Space Dogs has made that decision.
