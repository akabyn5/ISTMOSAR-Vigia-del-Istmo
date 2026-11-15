# Data Provenance

## Catalogued NISAR granules

The scene catalogue records three NISAR L-band Level-2 GCOV production granules. The identifiers below are copied from the product names and the project's acquisition audit records.

| Acquisition date | Cycle | Track | Frame | Orbit fidelity | CMR granule ID |
|---|---:|---:|---:|---|---|
| 2026-06-16 | 023 | 040 | 084 | Forecast | G4250187623-ASF |
| 2026-06-28 | 024 | 040 | 084 | Near Real-Time | G4240958164-ASF |
| 2026-10-14 | 033 | 040 | 084 | Near Real-Time | G4371433684-ASF |

All three catalogue entries identify descending acquisitions, Production processing, Frequency A, and HHHH/HVHV polarization terms. See `assets/data/scenes.json` for the complete product filenames.

## Geographic coverage caveat

The catalogue does not claim that any granule, or their common intersection, has passed final coverage checks against an approved Chagres–Gatún area of interest. Equal raster grids and compatible metadata are not equivalent to an approved study-area footprint.

## Public assets

No NISAR raster preview is included in this initial release. When previews are added, this document must be updated with their source granule, polarization, radiometric units, processing steps, spatial extent, resampling/display stretch, NoData handling, and validation status.

## References

- [NASA–ISRO NISAR mission](https://nisar.jpl.nasa.gov/)
- [ASF NISAR Cookbook — GCOV introduction](https://asfopensarlab.github.io/NISAR_Cookbook/gcov-intro/)
