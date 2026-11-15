# User Guide

## Navigate the site

Use the top navigation to move between Home, Radar Explorer, Change Explorer, Science & Methodology, and About & Data Sources. On a phone, open the **Menu** button.

## Radar Explorer

1. Choose one of the three acquisitions in the scene selector (June 16, June 28 or October 14, 2026).
2. The map shows that acquisition's exploratory NISAR HHHH backscatter preview over the OpenStreetMap basemap, and the panel shows the matching metadata: date, product level, cycle, relative track, frame, orbit direction, frequency, orbit-and-pointing fidelity, polarizations, CRID, UTC acquisition window, granule ID, CMR concept ID and collection status. The image and the metadata always change together.
3. **Radar layer** controls: tick or untick "Show radar preview" to hide or show the image, and move the **Opacity** slider (10–100 %) to see the basemap through it. Visibility and opacity are independent; hiding the layer keeps your opacity setting.
4. The map opens framed on the whole preview extent. After panning or zooming, the ⤢ button (below the zoom buttons) returns to that view. The layers button (top right) can also switch the image and the dashed extent on and off.
5. The legend (bottom left) shows the shared grayscale scale in dB. Press **−** to minimize it and **+** to expand it; on small screens it starts minimized.
6. The status checklist keeps four things separate: preview availability, metadata verification, visual inspection and scientific approval. "Pending" means the check has not been done yet.

The dashed rectangle is a **provisional raster viewing extent**. It is not an acquisition footprint, a watershed or an approved study area.

## Change Explorer

The comparison panel overlays two single-date previews. It is a **visual comparison only — not validated change detection**.

- Pick a **Before** (earlier) and an **After** (later) acquisition. All three chronological pairs are available: June 16 → June 28 (12 days), June 16 → October 14 (120 days) and June 28 → October 14 (108 days). Options that would make an impossible pair are disabled; if you pick a Before date that is not earlier than the After date, the After scene moves to the next later acquisition.
- Move the **Crossfade** slider from the earlier image to the later one, use **Layer opacity** for the overall strength, and tick or untick "Show earlier layer" / "Show later layer" to switch each image on its own.
- The metadata of both scenes is listed under the map. Every pair is marked PENDING scientifically.
- No difference map, change statistic, flooding estimate or environmental conclusion is produced.

## Science & Methodology

This section explains NISAR and L-band SAR, Level-2 GCOV, HHHH versus HVHV, the linear-power to decibel conversion, how the previews are made, the provisional extent, quality and validation limits, and why visual differences do not establish a cause. It also contrasts an exploratory image preview with a scientifically validated analysis result.

## If something does not appear

- A message in the map names a preview file that could not be loaded; check that the file exists in `assets/maps/`.
- "Catalogue unavailable" means `assets/data/scenes.json` could not be read. When running locally, use a local server (see the README), not `file://`.

## External services

The basemap uses OpenStreetMap tiles and Leaflet; fonts come from Google Fonts. An internet connection is required for those external resources.
