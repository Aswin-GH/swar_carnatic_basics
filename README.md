# SWAR, music and more - Carnatic basics

A Tamil-first Carnatic notation and singalong canvas designed for desktop and tablet.

## Run locally

The application is intentionally buildless and static so it can move cleanly to GitHub Pages later.

```sh
cd dist
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Structure

- `dist/curriculum-db.js` — canonical authors, sources, school tracks and lesson records
- `dist/content.js` — query/normalization adapter for renderers
- `dist/app.js` — notation rendering, controls and Web Audio synthesis
- `dist/styles.css` — responsive product design
- `dist/print.html`, `print.js`, `print.css` — printable 01–06 curriculum booklet generated from the same lesson records
- `dist/melakarta.html` — standalone 72-mēḷakarta Katapayādi decipherer, scale player and chakra library
- `dist/metronome.html` — standalone 35-combination sūḷādi-tāḷa metronome with anga actions and speed subdivisions
- `dist/glossary.html` — English-first, Tamil-alongside foundation glossary
- `dist/data/` — researched rāga and tāḷa reference records reused from the Mēḷas project
- `dist/assets/` — project-owned artwork, including the three-frame tāḷa hand-action sprite
- `dist/manifest.webmanifest` — install metadata and PWA icons
- `dist/sw.js` — offline application-shell caching

## Content model

Each lesson stores its school-independent musical data once. Tamil and English notation, speed subdivision, highlighting, playback and the printable booklet are derived from the same ordered swara sequence. Records carry author, source, rāgam, tāḷam, school-track and supported-speed metadata so future teacher views can reuse the same curriculum.

Comma tokens are parsed as continuation beats rather than repeated notes. With Sustain enabled by default, the audio engine creates one envelope spanning the note and all following continuations for simple tone, violin and flute. With Sustain disabled, the note releases early and the remaining continuation beats are silent.

Playback also shows a translucent three-frame hand cue once per tāḷa beat. Its timing follows the beat duration rather than the number of swaras inside that beat, with the significant middle frame held for most of the gesture. The supplied sprite covers clap, wave, little, ring, middle and index.

Speed subdivision runs continuously through the curriculum rows: first speed places one swara per beat, second speed combines two consecutive source lines into one tāḷa cycle, and third speed combines four. An incomplete final cycle is padded with visible rests rather than repeating its last line.

The foundation contains 44 lessons: 14 Sarali, 9 core Janta plus one source-backed Vakra Janta, 5 Melsthayi, 3 Dhatu, 5 Keezh / Mandra-sthayi and 7 canonical sapta-tāḷa alankarams. Sarali 10–14 are color-tagged as the published alternate Madhyasthayi grouping without duplicating them. The third Dhatu sequence is explicitly tagged as extended because the Karnataka foundation source specifies two while the notation reference publishes three. The five lower-octave lessons follow the published Mandra-sthayi progression and retain dotted source notation in the canonical records; the adapter derives visual octave dots and sub-octave audio from those tokens. Alankarams carry their own anga and jāti-driven tāḷa records rather than being flattened into Ādi tāḷam. Swar — Music and More is represented as the curriculum author. The scope intentionally ends with alankarams; the Explore tools preserve the richer teaching interactions from the Mēḷas project while remaining separate reference spaces rather than additional graded lessons.

## Deployment direction

The relative URLs, manifest scope and service-worker registration are compatible with a GitHub Pages repository subpath. The application shell, curriculum modules, artwork and icons are cached for offline use after the first successful visit. Navigation uses a network-first strategy so published curriculum updates replace the offline copy cleanly.

The production site is published from the root of the `gh-pages` branch. To publish an updated `dist/` directory from `main`:

```sh
git subtree split --prefix dist -b pages-release
git push origin pages-release:gh-pages --force
git branch -D pages-release
```

The manifest provides standalone installation metadata for Android and Chromium/Edge on Windows. Apple mobile-web-app metadata and a dedicated 180 px touch icon support Add to Home Screen on iOS and iPadOS.

