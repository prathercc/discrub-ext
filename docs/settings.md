## Settings
Settings are used by the extension to customize your experience, and they can be adjusted in a few different places:

 - Routing to **Menu -> Settings** via the top left of the extension window (see [Navigating Discrub](https://github.com/prathercc/discrub-ext/blob/development/docs/navigating_discrub.md)).
 - Export dialog when exporting a Server or DMs.
 - Purge dialog when purging a Server or DMs.

<img width="400px" src="https://i.imgur.com/ONU2ZGf.png">

<img width="400px" src="https://i.imgur.com/xJYNXLI.png">

<img width="400px" src="https://i.imgur.com/OivzlFo.png">

**Note:** The values entered for these settings will persist for each session, so you **will not** need to re-enter these each time you use Discrub.

Below is an overview of each possible setting and what behavior it defines:

 - **Fetch Reaction Data** - Determine if the extension should attempt to lookup Reaction data for any messages that are found during searches.
	 - *Having this setting toggled off, can significantly improve message search times.*
 - **Lookup Server Nicknames & Roles** - Determine if nicknames and roles should be looked up when loading/exporting messages from Servers.
 - **Lookup Display Names** - Determine if a User's display name should be looked up before loading/exporting messages.
	 - *If this is toggled off, expect to see only the Username of the User.*
 - **User Data Refresh Rate** - How often should the extension attempt to retrieve fresh data for Users discovered during the search process.
	 - *By default the extension attempts to cache this data to save on time when performing searches.*
 - **Delay Spread Seconds** - Adds additional randomization to the Modify Delay Seconds and Search Delay Seconds settings.
	 - *This setting will help prevent identical amounts of time from being used for delays, used as an additional anti-ban feature.* 
 - **Modify Delay Seconds** - How many seconds should the extension delay before making the next delete/edit/modification attempt.
	 - *Applies to any modification attempt (eg. Reaction, Message, Attachment etc...).*
	 - *Used as an additional anti-ban feature.*
 - **Search Delay Seconds** - How many seconds should the extension delay before making the next search attempt.
	 - *Used as an additional anti-ban feature.*
 -  **Date Format** - The format in which dates will be displayed throughout the extension and in exports.
 - **Time Format** - The format in which times will be displayed throughout the extension and in exports.
 - *(Purge Only)* **Remove Reactions From** - Users from whom to remove reactions from.
	 - *If this setting is used during a Purge, expect that only reactions will be removed, **and for no messages to be deleted**.*
 - *(Purge Only)* **Keep Attachments** - Should attachments be retained during the Purge process.
