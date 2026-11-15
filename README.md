# ISTMOSAR — Vigía del Istmo

**Space Dogs · Advanced Research Projects and International Programs (ARPIP) · NASA Space Apps Challenge 2026**

ISTMOSAR is an early-stage public web application for exploring selected NASA–ISRO NISAR L-band Level-2 GCOV acquisitions relevant to research in Panama.

> **Current release status:** exploratory. The site shows three genuine NISAR-derived HHHH backscatter previews on a Leaflet map, synchronized acquisition metadata, and a **visual-only** two-date comparison. The previews are display products: quality masks are not applied, the product is PROVISIONAL where verified, and no study-area polygon, difference map, change statistic or flooding estimate has been scientifically approved or published. This is **not** a validated change-detection system.

## Current features

- Responsive single-page interface with five navigation sections.
- Leaflet map with an OpenStreetMap basemap, framed on the full extent of the raster previews (`fitBounds`), with a "zoom to preview extent" button.
- Scene selector for three acquisitions (June 16, June 28 and October 14, 2026) that updates the preview image, the acquisition metadata and the status checklist together.
- Radar layer controls: a visibility checkbox and an opacity slider (independent of each other), plus a compact, collapsible HHHH dB legend.
- Metadata panel: date, UTC acquisition window, cycle, relative track, frame, orbit direction, orbit-and-pointing fidelity, polarizations, CRID, granule ID, CMR concept ID (marked unverified) and collection status.
- Status checklist that keeps four things separate: preview availability, metadata verification, visual inspection and scientific approval.
- Change Explorer: visual comparison of all three chronological date pairs (June 16 → June 28, June 16 → October 14, June 28 → October 14) with before/after selectors, crossfade, opacity and layer visibility. Impossible choices are disabled. Every pair carries the notice "Visual comparison only — not validated change detection."
- Science & Methodology panel: NISAR, L-band SAR, GCOV, HHHH versus HVHV, the dB conversion, how the previews are made, the provisional extent, quality limits and why visual differences are not proof of a cause.
- GitHub Actions deployment to GitHub Pages on pushes to `main`.

## Repository structure

```text
ISTMOSAR-Vigia-del-Istmo/
├── index.html
├── README.md
├── .gitignore
├── .nojekyll
├── assets/
│   ├── css/styles.css
│   ├── js/app.js             # scene selector, metadata panel, status checklist, navigation
│   ├── js/map.js             # Leaflet map, preview overlay, opacity/visibility, legend, framing
│   ├── js/comparison.js      # visual two-date comparison (no difference computation)
│   ├── data/scenes.json      # scene metadata, preview bounds, verification states
│   ├── data/study_area.json  # provisional raster viewing extent (not an approved study area)
│   ├── maps/                 # three reviewed, lightweight PNG previews
│   └── images/               # approved project logos/images (none yet)
├── docs/
│   ├── SCIENTIFIC_METHOD.md
│   ├── DATA_PROVENANCE.md
│   ├── LIMITATIONS.md
│   ├── USER_GUIDE.md
│   ├── KNOWN_ISSUES.md
│   └── STAGE4_READINESS.md
└── .github/workflows/deploy.yml
```

Frontend work needs only this repository: the previews and their metadata are already in `assets/`. The original HDF5 products and full-size GeoTIFFs are **not** needed to develop or maintain the interface.

## Run locally

From the repository root, start a local static server. With Python installed:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000` in a browser. Do not open `index.html` directly from File Explorer: the scene catalogue is loaded with `fetch()` and needs an HTTP server.

## Deploy with GitHub Pages

1. Keep the repository public with the single `main` branch.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. The workflow in `.github/workflows/deploy.yml` deploys the root static site after pushes to `main`.
4. Confirm the deployment is successful in the **Actions** tab and open the public Pages URL.

## Data handling policy

Do not commit original NISAR HDF5 products, full-size GeoTIFF exports, QA sidecars, credentials, private datasets, or local Python environments. Keep large source data and intermediate processing products in controlled local/private storage. Publish only small previews and supporting metadata that have been checked and approved for public release.

The `.gitignore` excludes common large raster and HDF5 file types as a safeguard. Review `git status` before every commit; `.gitignore` is not a substitute for checking staged files. Do not put personal local file-system paths in public documentation.

## Scientific status and interpretation

- GCOV is a Level-2 geocoded polarimetric covariance product. The measurement convention used in this project is gamma-zero linear power; the previews are shown in dB (`10 · log10(power)`).
- HHHH and HVHV represent different diagonal covariance terms and are separate measurements. The previews show HHHH only.
- The orbit-and-pointing fidelity of the June 16 acquisition is Forecast; June 28 and October 14 are Near Real-Time. `P05023` is the Composite Release ID (CRID).
- The dashed rectangle and the image bounds are a **provisional visualization extent** (the envelope of the shared raster grid), not an official acquisition footprint and not an approved Chagres–Gatún study area.
- CMR verification is pending for all scenes. The October 14 record is associated with `NISAR_L2_GCOV_PROVISIONAL_V1`; the collection of the June scenes is not confirmed.
- A backscatter difference is not, by itself, proof of a specific environmental cause.
- Quantitative change analysis stays disabled until the study area, footprints, QA evidence, common-valid pixels and analysis method are accepted.

See `docs/` for the method, provenance, limitations and user guidance.

## External references

- [NASA–ISRO NISAR mission](https://nisar.jpl.nasa.gov/)
- [ASF NISAR documentation — data availability and PROVISIONAL products](https://nisar-docs.asf.alaska.edu/availability-overview/)
- [ASF NISAR Cookbook — GCOV introduction](https://asfopensarlab.github.io/NISAR_Cookbook/gcov-intro/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright)

## License

A project-wide software license has not yet been selected. Do not assume that the source code, project identity, or scientific data are licensed for unrestricted reuse. Add a license only after Space Dogs has made that decision.
