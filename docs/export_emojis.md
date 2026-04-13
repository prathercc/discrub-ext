## Export Emojis

This fork adds a dedicated **Export Emojis** dialog in the main menu. It is separate from message export and is focused on guild emoji and sticker extraction.

## What It Exports

The current local fork state can export:

- emoji only
- emoji plus stickers

The exporter scans guild asset data for the currently authenticated account, downloads eligible assets, normalizes output formats, and packages the result into one archive.

## Current Workflow

The current local workspace uses a ZIP-first flow rather than triggering one browser download per asset.

Confirmed current behavior:

- one archive per export run
- archive log file included in the package
- manifest written into the package
- partial archive generation if the run is stopped
- resume/checkpoint state stored in extension storage
- manifest import before export

## Dialog Options

The exporter currently exposes these controls:

- **Import Manifest** - load a previously exported or partial manifest and seed the run from it
- **Clear Manifest** - clear imported manifest data and remove saved resume state
- **Workers** - number of guild workers used for parallel processing
- **Generate Meta Files** - emit website-oriented helper files in addition to the manifest
- **Include Stickers** - include sticker assets in the same run as emoji

These controls are local to the exporter dialog. They are not part of the persistent global Settings page.

## Final Output Rules

The current workspace does not blindly trust the transport extension used to fetch assets. It detects the real binary format and animation state, then writes a normalized final file.

Current rules:

- static image assets -> `png`
- animated image assets -> `gif`
- JSON/Lottie assets -> `json`

That rule applies to emoji and stickers in the current exporter implementation.

## Why The Finalization Step Exists

The exporter had to work around practical Discord/browser issues that showed up during fork development:

- direct animated emoji `.gif` transport was unreliable in the tested flow
- animation state could not safely be inferred from filename alone
- browser/runtime metadata was not reliable enough for some animated assets

The current local exporter therefore:

- fetches animated emoji through a WebP transport path when needed
- inspects asset bytes to determine actual format and frame structure
- routes animated output through local GIF finalization

## Archive Layout

The exact archive contents can vary depending on options, but the current exporter writes data in a structure centered around:

- exported asset files
- manifest JSON
- optional meta/helper files
- export log text file

When meta generation is enabled, helper files are written under a dedicated metadata area in the archive.

## Naming

The current workspace applies website-style filenames to exported assets. Naming is derived from the finalized asset type and extension, not just from the download transport format.

## Resume Behavior

Resume state is stored in extension storage and includes:

- next guild checkpoint
- completed guild IDs
- seen asset keys
- manifest entries
- whether meta generation was enabled

If the saved resume state does not match the current meta-generation mode, the exporter ignores that resume state instead of mixing incompatible runs.

## Limits And Caveats

- The exporter only sees emoji/stickers available through the authenticated account's accessible guild list.
- Permission failures are logged and counted, not treated as proof that a guild has no assets.
- Per-asset conversion failures are logged and skipped so one bad asset does not kill the whole export.
- This is fork-specific functionality and does not exist in upstream `prathercc/discrub-ext`.
