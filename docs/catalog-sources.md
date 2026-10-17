# Catalog and image provenance

## Imported metadata

The importer `scripts/import-catalog.py` consumes actual source CSV rows, excludes adult-flagged records, validates numeric TMDB identifiers, removes duplicate IDs, and sorts by the source vote counts before selecting records. It does not synthesize movie names, synopses, ratings or episode counts. Missing genres are labeled Uncategorized.

- Movies: [`data/movies_metadata.csv`](https://github.com/kaushikjadhav01/Movie-Recommendation-Chatbot/blob/2974c9c5b583edb27e1b9c2d7de2ff94d100115b/data/movies_metadata.csv), pinned commit `2974c9c5b583edb27e1b9c2d7de2ff94d100115b`. The input has 45,466 rows. The import selects 10,000 unique records with valid poster paths and at least 20 source votes.
- Television: [`TMDB_tv_dataset_flat_file.csv`](https://github.com/Asafhenig1/DS17_TMDB_Project/blob/7d6187a3c99a3012307779dddc7e047808c1176c/TMDB_tv_dataset_flat_file.csv) joined by TMDB ID to `Dataset_text.csv`, pinned commit `7d6187a3c99a3012307779dddc7e047808c1176c`. The input has 71,370 rows. The import selects 5,000 unique records with at least 10 source votes. This processed source omits poster paths and per-season episode lists.
- The existing curated 16-title selection is retained. Seven curated IDs are absent from the selected imported records, producing 15,007 unique titles in the merged UI.
- `public/data/provenance.json` records the pinned source repositories and revisions. Descriptions and TMDB images remain the property of their respective sources/rightsholders. This archival dataset is not a current streaming-availability feed or a fresh 2026 release catalog.

To reproduce, obtain those exact CSV snapshots and run:

```sh
python3 scripts/import-catalog.py movies_metadata.csv TMDB_tv_dataset_flat_file.csv Dataset_text.csv
```

This writes the compact index and 500-record detail chunks under `public/data`. The build-time TMDB enrichment script can fill missing poster/backdrop paths and actual season lists when a securely configured token is available. It does not write credentials to output files.

## Bundled photographic previews

The six spotlight entries have real photographic image assets bundled locally. These are film promotional images/stills from the following source paths; they are not AI-generated illustrations:

| Film | Repository and original path | Local asset |
|---|---|---|
| Dune: Part Two | [RamonSFR/dune2LandingPageClone](https://github.com/RamonSFR/dune2LandingPageClone), `src/images/home/home_bg_desktop.jpg` | `public/stills/dune.jpg` |
| Oppenheimer | [lyannabueno/oppenheimer-landing_page](https://github.com/lyannabueno/oppenheimer-landing_page), `src/images/hero/hero.jpg` | `public/stills/oppenheimer.jpg` |
| Blade Runner 2049 | [Kc1t/BladeRunnerPage](https://github.com/Kc1t/BladeRunnerPage), `assets/img/bgFull.png` | `public/stills/blade-runner-full.png` |
| Interstellar | [kelviinchaves/interstellar-landing-page](https://github.com/kelviinchaves/interstellar-landing-page), `dist/images/banner-miller-wave.jpg` | `public/stills/interstellar.jpg` |
| Inception | [SwarajKotapati/Inception-Movie](https://github.com/SwarajKotapati/Inception-Movie), `Pics/level1.jpg` | `public/stills/inception.jpg` |
| The Batman (2022) | [juliocjunior/TheBatman_landing-page](https://github.com/juliocjunior/TheBatman_landing-page), `src/images/background_sinopse_mod.png` | `public/stills/batman.png` |

The pre-existing Planet Earth II poster comes from [waleedthedev/Planet-Earth-II](https://github.com/waleedthedev/Planet-Earth-II). Other poster URLs use TMDB image filenames from the metadata or the existing curated set. Live CDN paths are not verified from this cloud because the proxy blocks the image host. Failed or absent artwork shows a neutral title placeholder, never a fabricated still or another film's image.
