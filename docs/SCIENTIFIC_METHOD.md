# Scientific Method — ISTMOSAR

## Scope of this release

This initial website release displays acquisition metadata and a general basemap. It does not display geospatial NISAR raster previews or calculated change products.

## Measurement context

Synthetic Aperture Radar (SAR) is an active microwave remote-sensing technique. A SAR measurement is a radar return, not a visible-light photograph. The observed backscatter depends on the interaction between the radar signal and surface properties, as well as acquisition and viewing geometry.

The project uses NISAR L-band Level-2 Geocoded Polarimetric Covariance (GCOV) products. GCOV provides calibrated backscatter measurements as gamma-zero power values and includes geocoded covariance layers. Supporting layers can include number of looks, mask, and the RTC gamma-to-sigma factor.

## Polarization

The currently catalogued products include Frequency A HHHH and HVHV layers. HHHH is the co-polarized HH-to-HH diagonal covariance term. HVHV is the cross-polarized HV-to-HV diagonal covariance term. These are distinct measurements and should not be combined as though they were the same channel.

## Radiometric convention

The native measurement convention for this project is gamma-zero linear power. For visualization in decibels, positive linear power values may be converted using:

`gamma0_dB = 10 * log10(gamma0_linear)`

Do not apply a 20-logarithm amplitude conversion to these power measurements. Do not apply the RTC gamma-to-sigma factor unless the project deliberately changes and documents its measurement convention.

## Conditions for a future comparison

A quantitative comparison requires, at minimum:

1. A definitive study-area polygon and verified intersections with official acquisition footprints.
2. Reviewed product QA reports, statistics, and mask interpretation.
3. Compatible grids, CRS, measurement channels, and radiometric conventions.
4. A documented common-valid-pixel mask.
5. Reproducible processing, statistics, and uncertainty/limitation statements.

Until these conditions are accepted, the change explorer remains informational and does not display quantitative change claims.
