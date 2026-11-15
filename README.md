# ISTMOSAR — Vigía del Istmo

**Space Dogs · Advanced Research Projects and International Programs (ARPIP) · NASA Space Apps Challenge 2026**

ISTMOSAR is an early-stage public web application for exploring the context and metadata of selected NASA–ISRO NISAR L-band Level-2 GCOV acquisitions relevant to research in Panama.

> **Current release status:** The site provides an interactive OpenStreetMap basemap, a scene-metadata catalogue, and project/methodology information. It does not yet publish NISAR raster previews, an approved study-area polygon, or quantitative change-detection results.

## Current features

- Responsive single-page interface with five navigation sections.
- Leaflet map with OpenStreetMap basemap.
- Scene selector populated from `assets/data/scenes.json`.
- Acquisition metadata for three NISAR L2 GCOV granules.
- Explicit notices for pending study-area and scientific approval.
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
│   ├── js/app.js
│   ├── js/map.js
│   ├── js/comparison.js
│   ├── data/scenes.json
│   ├── data/study_area.json
│   ├── maps/                 # Add only reviewed, compressed previews
│   └── images/               # Add approved project logos/images
├── docs/
│   ├── SCIENTIFIC_METHOD.md
│   ├── DATA_PROVENANCE.md
│   ├── LIMITATIONS.md
│   └── USER_GUIDE.md
└── .github/workflows/deploy.yml
```

## Run locally

From the repository root, start a local static server. With Python installed:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000` in a browser. Do not open `index.html` directly from File Explorer: the scene catalogue is loaded with `fetch()` and needs an HTTP server.

## Deploy with GitHub Pages

1. Create a **public, empty** GitHub repository named `ISTMOSAR-Vigia-del-Istmo`.
2. Push this project to the single `main` branch.
3. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
4. The workflow in `.github/workflows/deploy.yml` deploys the root static site after pushes to `main`.
5. Confirm the deployment is successful in the **Actions** tab and open the public Pages URL.

## Data handling policy

Do not commit original NISAR HDF5 products, full-size GeoTIFF exports, QA sidecars, credentials, private datasets, or local Python environments. Keep large source data and intermediate processing products in controlled local/private storage. Publish only small previews and supporting metadata that have been checked and approved for public release.

The `.gitignore` excludes common large raster and HDF5 file types as a safeguard. Review `git status` before every commit; `.gitignore` is not a substitute for checking staged files.

## Scientific status and interpretation

- GCOV is a Level-2 geocoded polarimetric covariance product. The measurement convention used in this project is gamma-zero power.
- HHHH and HVHV represent different diagonal covariance terms and should be treated as separate measurements.
- A raster grid match does not by itself establish that the official scene footprints intersect an approved Chagres–Gatún area of interest.
- A backscatter difference is not, by itself, proof of a specific environmental cause.
- Pairwise comparison remains disabled until the study area, footprints, QA evidence, common-valid pixels, and analysis method are accepted.

See `docs/` for the current method, provenance, limitations, and user guidance.

## External references

- [NASA–ISRO NISAR mission](https://nisar.jpl.nasa.gov/)
- [ASF NISAR Cookbook — GCOV introduction](https://asfopensarlab.github.io/NISAR_Cookbook/gcov-intro/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright)

## License

A project-wide software license has not yet been selected. Do not assume that the source code, project identity, or scientific data are licensed for unrestricted reuse. Add a license only after Space Dogs has made that decision.
