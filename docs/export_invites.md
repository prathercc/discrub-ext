## Export Invites

This fork adds a dedicated **Export Invites** dialog in the main menu. It is separate from message export and is meant for invite discovery across guilds visible to the currently authenticated Discord account.

## What It Does

The exporter walks the guild list and tries to resolve one useful invite per guild. Output is written as a single plain-text file.

The code currently uses this fallback order:

1. guild vanity URL endpoint
2. vanity code returned from guild data
3. widget invite from `widget.json`
4. invite creation on candidate channels
5. existing invites on candidate channels

All successful results are normalized into `https://discord.gg/<code>`.

## Export Flow

When you run the exporter:

- the dialog opens from **Menu -> Export Invites**
- the exporter scans every loaded guild available to the current token
- progress and errors are written into the on-screen log
- the final result is downloaded as one `.txt` file

If the dialog is closed while export is running, the button switches into a stop request and the exporter finishes the current step before exiting.

## Output Format

The exported text file contains:

- generation timestamp
- total guild count
- success/failure summary
- one section per guild

Successful entries include the resolved invite URL. Failed entries record a short reason such as `no permission`, `no invite found`, or `unknown error on channels`.

## Channel Selection Notes

The exporter only tests channel types that can plausibly host invites. Text-like channels are tried first, then other supported guild channel types.

There is also an early-stop rule for repeated permission failures so the exporter does not waste time walking a large number of inaccessible channels in a guild.

## Limits And Caveats

- The exporter only sees what the authenticated account can see.
- It cannot recover invites where the account lacks access to every usable source.
- Some guilds will report `no permission` or `no invite found` even when the guild itself is visible.
- The exporter is intentionally practical: it aims for one usable invite per guild, not a full invite inventory.
