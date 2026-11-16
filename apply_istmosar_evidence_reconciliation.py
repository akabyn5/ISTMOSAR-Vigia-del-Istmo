from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
BACKUP_DIR = ROOT.parent / f"{ROOT.name}_istmosar_backup_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"

REQUIRED = [
    "index.html",
    "assets/data/scenes.json",
    "README.md",
    "docs/DATA_PROVENANCE.md",
    "docs/SCIENTIFIC_METHOD.md",
    "docs/LIMITATIONS.md",
    "docs/KNOWN_ISSUES.md",
    "docs/STAGE4_READINESS.md",
]

for rel in REQUIRED:
    if not (ROOT / rel).is_file():
        raise SystemExit(f"ERROR: Required repository file not found: {rel}\nRun this script from the repository root.")

# ---------------------------------------------------------------------------
# 1) index.html — evidence corrections only; the application UI is unchanged.
# ---------------------------------------------------------------------------
index_text = (ROOT / "index.html").read_text(encoding="utf-8")
index_replacements = [
    (
        "Each scene’s collection is still pending verification against its official CMR record.",
        "The raw CMR UMM-G records for all three selected granules have been retrieved and parsed. "
        "Their granule concept IDs and GranuleUR values match the corresponding project granule records. "
        "Each record identifies the NISAR_L2_GCOV_PROVISIONAL_V1 collection, Version 1. The exported CMR "
        "spatial-footprint GeoJSON for each scene also matches the spatial boundary in its UMM-G record. "
        "This verifies catalogue provenance and footprint-record consistency; it does not approve the project "
        "study area, pairwise scientific compatibility, QA policy, or environmental interpretation."
    ),
    (
        "The effect of non-positive source values on neighbouring averaged pixels has not yet been investigated.",
        "A full-scene scan of the three Stage 2 HHHH rasters found no finite zero or negative source values "
        "and no positive or negative infinities. NaN/NoData samples remain. The previews average-resample "
        "linear power before converting positive destination values to dB. However, the treatment and spatial "
        "influence of source NaN/NoData samples during average resampling have not been independently quantified. "
        "This remains an exploratory display workflow, not a validated quality-control procedure."
    ),
    (
        "Data quality limits: QA reports and masks have not been reviewed, no common-valid mask exists between dates, "
        "and the June 16 scene has Forecast orbit and pointing fidelity (June 28 and October 14 are Near Real-Time).",
        "Data quality limits: GCOV mask semantics have been reviewed against the applicable NISAR GCOV Product "
        "Specification, Revision F. Full-scene distributions of mask, inputDataExceptionMask, and numberOfLooks "
        "have also been inspected. The two mask layers have distinct meanings, and neither is applied to these "
        "exploratory previews. The nine candidate upstream QA sidecars previously examined were HTML responses, "
        "not valid PDF, HDF5, or CSV QA products. ASF sidecar enumeration/recovery and local nisarqa execution "
        "remain outstanding. No approved QA policy or common-valid-pixel mask exists. All quantitative date pairs "
        "remain pending. The June 16 scene has Forecast orbit and pointing fidelity; June 28 and October 14 are "
        "Near Real-Time."
    ),
]
for old, new in index_replacements:
    count = index_text.count(old)
    if count != 1:
        raise SystemExit(
            "ERROR: index.html patch guard failed. Expected one exact occurrence, "
            f"found {count}: {old[:110]!r}\nNo files have been changed."
        )
    index_text = index_text.replace(old, new, 1)

# ---------------------------------------------------------------------------
# 2) scenes.json — update evidence metadata while retaining all UI fields.
#    Collection concept IDs are deliberately NOT propagated from one scene to
#    another. A collection concept ID must be copied from each raw record only
#    after its per-granule relationship is independently confirmed.
# ---------------------------------------------------------------------------
scenes_path = ROOT / "assets/data/scenes.json"
try:
    scenes_data = json.loads(scenes_path.read_text(encoding="utf-8"))
except json.JSONDecodeError as exc:
    raise SystemExit(f"ERROR: scenes.json is not valid JSON: {exc}\nNo files have been changed.")

if not isinstance(scenes_data.get("scenes"), list) or len(scenes_data["scenes"]) != 3:
    raise SystemExit("ERROR: Expected exactly three scene records in scenes.json. No files have been changed.")

scene_expected = {
    "nisar-20260616": "G4250187623-ASF",
    "nisar-20260628": "G4240958164-ASF",
    "nisar-20261014": "G4371433684-ASF",
}

for scene in scenes_data["scenes"]:
    scene_id = scene.get("id")
    if scene_id not in scene_expected:
        raise SystemExit(f"ERROR: Unexpected scene ID in scenes.json: {scene_id!r}. No files have been changed.")
    expected_concept = scene_expected[scene_id]
    if scene.get("cmrGranuleId") != expected_concept:
        raise SystemExit(
            f"ERROR: CMR concept ID mismatch for {scene_id}: expected {expected_concept}, "
            f"found {scene.get('cmrGranuleId')!r}. No files have been changed."
        )

    cmr = scene.setdefault("cmr", {})
    cmr["granuleConceptId"] = expected_concept
    cmr["granuleConceptIdStatus"] = (
        "VERIFIED against the raw CMR UMM-G record: concept ID and GranuleUR match this scene's granule record."
    )
    cmr["ummG"] = "VERIFIED — raw UMM-G record retrieved, parsed, and matched to the local granule record."
    cmr["collectionShortName"] = "NISAR_L2_GCOV_PROVISIONAL_V1"
    cmr["collectionVersion"] = "1"
    cmr["collectionStatus"] = (
        "VERIFIED from the corresponding raw UMM-G record: collection short name "
        "NISAR_L2_GCOV_PROVISIONAL_V1, Version 1."
    )
    # Do not carry the October 14 summary ID over to the June scenes. The
    # public manifest records the collection short name/version, but leaves
    # the collection concept ID blank until it is checked per raw record.
    cmr["collectionConceptId"] = None
    cmr["collectionConceptIdNote"] = (
        "Not populated in this public manifest. Do not infer a collection concept ID from another granule; "
        "populate only after checking the corresponding raw UMM-G/collection reference."
    )
    cmr["spatialFootprintStatus"] = (
        "VERIFIED: exported CMR spatial-footprint GeoJSON matches the corresponding UMM-G spatial boundary. "
        "This is not AOI approval."
    )
    cmr["lookupUrl"] = f"https://cmr.earthdata.nasa.gov/search/granules.umm_json?concept_id={expected_concept}"
    cmr["localEvidence"] = (
        "Raw UMM-G record, exact-search export, and corresponding CMR spatial-footprint GeoJSON are retained "
        "in the local Phase D evidence package; these large audit files are not published in this repository."
    )

    catalog = scene.setdefault("catalogReference", {})
    catalog["catalog"] = "NASA CMR / ASF DAAC"
    catalog["url"] = cmr["lookupUrl"]
    catalog["status"] = (
        "Raw UMM-G record parsed; granule concept ID and GranuleUR matched; collection short name/version "
        "matched; exported CMR spatial footprint checked against UMM-G boundary. Not an AOI or pair approval."
    )

    verification = scene.setdefault("verification", {})
    verification["metadataVerifiedScope"] = (
        "HDF5 grid/CRS/dataset inspection plus raw CMR UMM-G granule-record linkage. "
        "Does not constitute AOI approval or scientific approval for comparison."
    )
    verification["sourceNonPositiveCheck"] = (
        "Full-scene Stage 2 HHHH scan: 0 finite zero values, 0 finite negative values, and 0 positive/negative "
        "infinities; NaN/NoData samples remain. This does not establish how source NaN/NoData samples influence "
        "average-resampled preview pixels or constitute QA acceptance."
    )
    # Preserve the preview's visual-verification flag, but force scientific
    # approvals to remain false regardless of the previous value.
    verification["approvedForComparison"] = False
    scene["footprintApprovedForStudyArea"] = False
    scene["scientificApproval"] = "pending"

scenes_data["lastUpdated"] = "2026-11-16"
scenes_data["pairsNote"] = (
    "All three pairs remain PENDING. CMR UMM-G granule records and per-scene footprint-record consistency "
    "have been verified, but this does not approve the AOI or pairwise comparisons. Revision F GCOV mask "
    "semantics and full-scene raster distributions have been reviewed; the candidate upstream QA sidecars "
    "previously examined were invalid HTML responses. No approved QA policy or common-valid-pixel mask exists. "
    "José makes the final scientific approval decision."
)
scenes_data["phaseNote"] = (
    "Phase C interface work is reported complete. Phase D technical review is partial, but quantitative "
    "scientific acceptance remains BLOCKED. The public application is an exploratory observation and "
    "visual-comparison interface only."
)
scenes_data["stage4Evidence"] = {
    "status": "PARTIAL REVIEW — provenance/footprint checks and GCOV raster diagnostics reviewed; scientific acceptance remains blocked.",
    "localDirectory": "SAR-Change-Detection/sar_demo_outputs/stage_4_readiness_evidence/",
    "contents": [
        "3 raw CMR UMM-G granule records: parsed; concept IDs and GranuleUR values matched to local granule records",
        "3 exported CMR spatial-footprint GeoJSON files: each checked against its corresponding UMM-G spatial boundary",
        "AOI candidate datasets: legacy PMCC 1998 subwatersheds and MiAmbiente HydroBASINS; neither approved",
        "3 candidate QA_REPORT sidecars: previously inspected files contained HTML responses, not valid PDF reports",
        "3 candidate QA_STATS sidecars: previously inspected files contained HTML responses, not valid HDF5 statistics files",
        "3 candidate QA_SUMMARY sidecars: previously inspected files contained HTML responses, not valid CSV summaries",
        "Stage 2 HHHH, mask, inputDataExceptionMask, and numberOfLooks full-scene diagnostics"
    ],
    "gcovSpecificationReview": (
        "NISAR GCOV Product Specification Revision F reviewed for mask semantics. GCOV mask and "
        "inputDataExceptionMask are treated as distinct layers; no approved quality policy is established."
    ),
    "fullSceneRasterReview": (
        "Full-scene distributions of mask, inputDataExceptionMask, and numberOfLooks were inspected. "
        "The three Stage 2 HHHH scans found no finite zero/negative values and no positive/negative infinities; "
        "NaN/NoData samples remain. No numberOfLooks threshold has been invented or approved."
    ),
    "qaSidecarValidation": (
        "The nine previously inspected candidate sidecars were HTML responses and failed their expected "
        "PDF/HDF5/CSV file-signature checks. They are not valid upstream QA evidence."
    ),
    "asfSidecarRecovery": (
        "NOT EXECUTED in the latest reported attempt. Availability of QA sidecars for these granules remains unknown."
    ),
    "nisarqaExecution": "NOT RUN locally. A documentation/API compatibility review is not an executed QA run.",
    "approvalState": (
        "AOI approval, QA policy approval, mask-policy approval, pair approval, and quantitative processing "
        "authorization remain false/pending. No difference raster or quantitative change statistics were generated."
    )
}

scenes_json_text = json.dumps(scenes_data, ensure_ascii=False, indent=2) + "\n"
# Validate the serialized JSON before any repository writes.
json.loads(scenes_json_text)

# ---------------------------------------------------------------------------
# 3) README.md — replace with a current, conservative project overview.
# ---------------------------------------------------------------------------
readme_text = r'''# ISTMOSAR — Vigía del Istmo

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
'''

# ---------------------------------------------------------------------------
# 4) docs/DATA_PROVENANCE.md
# ---------------------------------------------------------------------------
data_provenance_text = r'''# Data Provenance

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
'''

# ---------------------------------------------------------------------------
# 5) docs/SCIENTIFIC_METHOD.md
# ---------------------------------------------------------------------------
scientific_method_text = r'''# Scientific Method — ISTMOSAR

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
'''

# ---------------------------------------------------------------------------
# 6) docs/LIMITATIONS.md
# ---------------------------------------------------------------------------
limitations_text = r'''# Limitations and Pending Scientific Work

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
'''

# ---------------------------------------------------------------------------
# 7) docs/KNOWN_ISSUES.md
# ---------------------------------------------------------------------------
known_issues_text = r'''# Known Issues and Pending Work

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
'''

# ---------------------------------------------------------------------------
# 8) New dated reconciliation document. Keep STAGE4_READINESS.md untouched.
# ---------------------------------------------------------------------------
phase_d_reconciliation_text = r'''# ISTMOSAR — Phase D Evidence Reconciliation

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
'''

outputs = {
    "index.html": index_text,
    "assets/data/scenes.json": scenes_json_text,
    "README.md": readme_text,
    "docs/DATA_PROVENANCE.md": data_provenance_text,
    "docs/SCIENTIFIC_METHOD.md": scientific_method_text,
    "docs/LIMITATIONS.md": limitations_text,
    "docs/KNOWN_ISSUES.md": known_issues_text,
    "docs/PHASE_D_EVIDENCE_RECONCILIATION_2026-11-16.md": phase_d_reconciliation_text,
}

# All transformations are prepared and validated before writing any file.
# Back up every existing file that will be changed or replaced.
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
for rel, content in outputs.items():
    target = ROOT / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        backup_target = BACKUP_DIR / rel
        backup_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, backup_target)

for rel, content in outputs.items():
    target = ROOT / rel
    target.write_text(content.rstrip() + "\n", encoding="utf-8", newline="\n")

# Post-write integrity checks.
json.loads((ROOT / "assets/data/scenes.json").read_text(encoding="utf-8"))
updated_data = json.loads((ROOT / "assets/data/scenes.json").read_text(encoding="utf-8"))
assert all(s["verification"]["approvedForComparison"] is False for s in updated_data["scenes"])
assert all(s["footprintApprovedForStudyArea"] is False for s in updated_data["scenes"])
assert all(p["status"] == "PENDING" for p in updated_data["pairs"])
assert "NOT_GENERATED_BLOCKED" in (ROOT / "docs/PHASE_D_EVIDENCE_RECONCILIATION_2026-11-16.md").read_text(encoding="utf-8")

print("ISTMOSAR evidence reconciliation applied successfully.")
print(f"Backup directory (outside repository): {BACKUP_DIR}")
print("Updated files:")
for rel in outputs:
    print(f"  - {rel}")
print("Preserved unchanged:")
print("  - docs/STAGE4_READINESS.md")
print("Scientific approval flags: all false; all three pair statuses: PENDING.")
