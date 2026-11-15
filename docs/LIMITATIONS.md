# Limitations and Known Pending Work

*Last updated: 2026-11-15.*

## What the website shows

Three single-date Frequency A HHHH backscatter previews (June 16, June 28 and October 14, 2026) displayed in dB on a shared grayscale scale, plus a visual two-date overlay. These are exploratory display products. No change layer, change statistic or flooding estimate is published.

## Interpreting NISAR GCOV backscatter

- **Surface roughness.** Rough surfaces scatter more energy back to the sensor than smooth ones. Wind-roughened water, ploughed or harvested fields, and calm water can look very different without any change in land cover.
- **Moisture conditions.** Soil and vegetation moisture change the radar's dielectric response. A wetter surface is often brighter, so a brightness change can reflect rainfall history rather than standing water.
- **Vegetation structure.** L-band interacts with canopy and trunks; the response depends on biomass, density, leaf state and structure. Growth, loss or phenology can change backscatter.
- **Radar scattering mechanisms.** Surface, volume and double-bounce scattering mix in each pixel. HHHH responds to these differently than HVHV, and the same value can come from different mechanisms.
- **Acquisition geometry.** The three scenes share relative track 040, descending direction and frame 084, which helps, but incidence angle varies across the swath and terrain can still affect the result. Geometry compatibility has not been independently audited for these previews.
- **Orbit fidelity.** The June 16 scene uses **Forecast** orbit/attitude fidelity; June 28 and October 14 use **Near Real-Time**. Differences in orbit quality can affect geolocation and radiometry. Pairs that include June 16 need extra scrutiny.
- **Quality masks.** The GCOV `mask` and `inputDataExceptionMask` were **not applied**; QA report/statistics/summary availability and validity have not been reviewed here. Previews may include invalid or low-quality pixels.
- **Valid-pixel limitations.** Only NaN, non-finite and non-positive values are transparent. About half of each preview is transparent because of the shape of the imaged swath inside the rectangular grid. No common-valid mask exists between dates.
- **Radar change is not flooding.** A difference in backscatter, even a large one, is not evidence of flooding, water-level change or deforestation without independent supporting evidence. Any such inference must be labelled as a hypothesis.

## Product and metadata maturity

- The only CMR collection reference seen (for October 14) is named `NISAR_L2_GCOV_PROVISIONAL_V1`. The data maturity and validation level must be confirmed from official product documentation before the results are interpreted quantitatively.
- Full CMR UMM-G records for all three granules are **pending raw JSON verification**. The CMR concept IDs are "previously associated" identifiers.
- Acquisition mode `4005`, track, direction and fidelity were read from the granule filenames and the project handoff, not from HDF5 attributes.

## Display limitations

- Previews are downsampled (1800 × 1773 px, roughly 190 m per pixel in Web Mercator units) from 10 m data and stretched to 8-bit grayscale. Fine detail and the full dynamic range are not preserved.
- The stretch (−25.94 to −4.44 dB) is shared by all scenes but is a visual choice, not a physical threshold.
- Image bounds are the envelope of the projected raster grid, **not** an official acquisition footprint.

## Study area

- No approved Chagres–Gatún boundary exists in the repository. The dashed rectangle on the map is a **provisional raster viewing extent**, not a watershed, administrative or study-area boundary.
- Pair approvals (June 16–28, June 28–Oct 14, June 16–Oct 14) are all PENDING. Identical grids and alignment are not scientific approval.

## Technical

- The site needs external services (Leaflet, OpenStreetMap tiles, Google Fonts). The basemap may not load offline.
- The map works only over HTTP(S); open it with a local server, not by double-clicking `index.html`.
