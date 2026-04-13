# Discrub Fork

This repository is a fork of [`prathercc/discrub-ext`](https://github.com/prathercc/discrub-ext). It keeps the upstream Discord message tooling, but extends the project with fork-specific export workflows aimed at bulk archival and asset extraction.

This README is fork-specific. It documents the current local fork state in this repository, not just upstream Discrub.

## Why This Fork Exists

Upstream Discrub already covers message search, filtering, export, and purge workflows well. This fork exists because the local use case pushed harder on:

- invite discovery across accessible guilds
- bulk emoji and sticker extraction
- browser-side packaging for very large exports
- predictable final asset formats instead of transport-format leaks
- exporter UX that stays usable during long runs

## What's Different In This Fork

### Invite exporter

The fork adds an **Export Invites** action in the menu. It scans guilds visible to the authenticated account and tries several invite sources before giving up:

1. guild vanity URL endpoint
2. guild data fallback vanity code
3. guild widget invite
4. channel invite creation
5. existing channel invites

Results are normalized to `https://discord.gg/<code>` and saved as a plain-text report with per-guild success or failure entries.

See [docs/export_invites.md](./docs/export_invites.md).

### Emoji and sticker exporter

The fork adds an **Export Emojis** action in the menu. The current local fork state replaces per-asset browser downloads with a ZIP-first archive flow and adds several reliability fixes around Discord asset transport:

- worker-pool processing across guilds
- optional sticker inclusion
- optional meta-file generation for downstream website ingestion
- resume/checkpoint state stored in extension storage
- archive log output
- manifest import and partial-manifest recovery
- website-style asset filenames

The exporter also normalizes final output instead of trusting the original transport extension:

- static image assets end as real `png`
- animated image assets end as real `gif`
- JSON/Lottie assets stay `json`

See [docs/export_emojis.md](./docs/export_emojis.md).

### Exporter workflow and UI changes

Confirmed fork-specific UI and workflow changes include:

- extra menu entries for invite and emoji export
- denser exporter dialogs with larger log viewports
- smaller monospace log rows to fit more progress output
- cleaner progress and error reporting
- emoji exporter state reset on close when idle, so reopening starts clean

## Build And Load

This fork is set up for local build and unpacked Chrome loading.

```bash
npm install
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the built `dist/` directory.

## Documentation

Fork-specific docs:

- [FORK-CHANGES.md](./FORK-CHANGES.md) - direct fork delta vs upstream
- [docs/export_invites.md](./docs/export_invites.md) - invite exporter behavior and limitations
- [docs/export_emojis.md](./docs/export_emojis.md) - emoji/sticker exporter workflow, options, and archive layout

Core upstream-style docs that still apply to the base product:

- [Opening the Extension / Authentication](./docs/opening_the_extension_and_authentication.md)
- [Navigating Discrub](./docs/navigating_discrub.md)
- [Configuring the Search Criteria](./docs/configuring_the_search_criteria.md)
- [Export a Server](./docs/export_a_server.md)
- [Export DMs](./docs/export_a_dm.md)
- [Purge a Server / DM](./docs/purge_a_server_or_dm.md)
- [Settings](./docs/settings.md)

## Upstream Credit

Credit for the original project, architecture, and core Discord message tooling belongs to the upstream project and maintainer:

- upstream repository: [`prathercc/discrub-ext`](https://github.com/prathercc/discrub-ext)

This fork is a derivative maintenance branch with additional export tooling and workflow changes on top of that base.
