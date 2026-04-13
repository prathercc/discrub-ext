# Fork Changes

This document compares the current local fork workspace in this repository against upstream `prathercc/discrub-ext`.

## Comparison Basis

- upstream reference in this repo: `origin/development`
- upstream commit observed locally during this pass: `f3b1936` (`1.12.11`)
- fork branch in this repo: `development`
- fork commit on top of upstream: `88f0e80`

The current workspace also contains additional uncommitted exporter refinements. Those are called out separately because they are part of the local fork state, but not all of them are in the committed fork delta yet.

## Confirmed Committed Differences

### 1. New menu-level exporters

Upstream does not expose dedicated invite or emoji-export tools from the main menu. This fork adds two menu actions:

- `Export Invites`
- `Export Emojis`

Evidence:

- `src/containers/discrub-dialog/components/menu-bar.tsx`

### 2. Invite exporter flow

This fork adds a dedicated invite exporter dialog and Discord API helpers for invite discovery.

Confirmed behavior from code:

- scans all accessible guilds for the current authenticated account
- tries vanity URL lookup first
- falls back to guild metadata vanity code
- falls back to guild widget invite
- then falls back to channel invite creation and existing channel invites
- normalizes output to `https://discord.gg/<code>`
- writes a single plain-text export file
- keeps per-guild success/error output in the dialog log
- supports stop-on-close behavior while running

Evidence:

- `src/containers/invite-export-button/invite-export-button.tsx`
- `src/services/discord-service.ts`

### 3. Emoji exporter added on top of upstream

Upstream does not include a dedicated menu-driven emoji/sticker exporter. This fork adds one.

Committed fork behavior confirmed from code:

- scans guild emoji data through guild API fetches
- supports manifest import
- persists resume state in extension storage
- logs progress in a dedicated dialog
- exports emoji assets with normalized filenames
- uses additional Discord service methods and menu integration

Evidence:

- `src/containers/emoji-export-button/emoji-export-button.tsx`
- `src/services/discord-service.ts`
- `src/containers/discrub-dialog/components/menu-bar.tsx`

### 4. Extension permissions changed for downloader use

Relative to upstream, the fork adds:

- `downloads` permission
- `https://cdn.discordapp.com/*` host permission

Evidence:

- `public/manifest.json`

## Additional Current Workspace Differences

These are present in the local fork workspace now and were also corroborated by the session-log reference folder, but they are not all part of the single committed fork diff shown above.

### 1. ZIP-first archive flow for emoji export

The current local workspace replaces per-asset browser downloads with a ZIP-first archive pipeline.

Confirmed behavior:

- assets are written into one archive instead of downloaded one-by-one
- archive logs are included in the ZIP
- partial archives can still be finalized on stop
- manifest files are added into the archive

Evidence:

- `src/features/export/archive-writer.ts`
- `src/containers/emoji-export-button/emoji-export-button.tsx`

### 2. Final format normalization

The local workspace now distinguishes between transport format, detected binary format, animation state, and final exported format.

Confirmed behavior:

- static image output is normalized to `png`
- animated output is normalized to `gif`
- JSON/Lottie assets stay `json`
- output naming uses the final normalized extension, not just the transport extension

Evidence:

- `src/containers/emoji-export-button/emoji-export-asset-format.ts`
- `src/containers/emoji-export-button/emoji-export-postprocess.ts`
- `src/containers/emoji-export-button/emoji-export-button.tsx`

### 3. Animated emoji and sticker reliability fixes

The session logs and current code both show that the fork had to work around Discord/CDN and browser-decoder issues.

Confirmed current behavior:

- animated emoji transport uses WebP fetches with `animated=true` instead of relying on direct `.gif` transport
- animation is detected from file bytes, not only runtime decoder metadata
- animated PNG/APNG stickers are routed through the same finalization logic as animated emoji
- per-asset format-processing failures are logged and skipped instead of crashing the whole export

Evidence:

- `src/containers/emoji-export-button/emoji-export-asset-format.ts`
- `src/containers/emoji-export-button/emoji-export-button.tsx`
- `CC-Session-Logs-and-readme-of-fork/13-04-2026-08_35-emoji-export-fixes.md`
- `CC-Session-Logs-and-readme-of-fork/13-04-2026-11_46-emoji-export-fixes-and-docs.md`

### 4. Website-style naming and meta-file generation

The current workspace adds website-oriented postprocessing for downstream ingestion.

Confirmed behavior:

- exported assets use a website-style naming convention
- optional meta-file generation can emit manifest/helper files
- renamed-file metadata is derived from finalized asset output

Evidence:

- `src/containers/emoji-export-button/emoji-export-postprocess.ts`
- `src/containers/emoji-export-button/emoji-export-button.tsx`

### 5. Exporter UI and workflow refinements

Confirmed current local UI changes:

- emoji exporter has worker-count control
- emoji exporter can include stickers in the same run
- emoji exporter can clear imported manifest and resume state
- exporter log viewport is denser and larger
- invite exporter log styling was adjusted to match the emoji exporter
- emoji exporter resets local dialog state on close when not exporting

Evidence:

- `src/containers/emoji-export-button/emoji-export-button.tsx`
- `src/containers/invite-export-button/invite-export-button.tsx`
- `CC-Session-Logs-and-readme-of-fork/13-04-2026-11_46-emoji-export-fixes-and-docs.md`

## Not Claimed As Confirmed

The reference logs explicitly mention ideas that are not documented here as confirmed fork scope unless they are backed by code:

- native helpers
- shell-side post-processing
- EXIF tagging

Those are intentionally excluded from the fork description because they are not supported by the current repository state.
