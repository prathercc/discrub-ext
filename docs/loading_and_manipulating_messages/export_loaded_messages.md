## Export Loaded Messages
With messages already loaded in the Channel Messages or Direct Messages module, you will see an Export button available, which will allow you to export the messages displayed on the table.

**Note:** Any quick filtering you've used **will** apply to the export!

<img width="400px" src="https://i.imgur.com/MnxdiDr.png">

<img width="400px" src="https://i.imgur.com/JEgnBVt.png">

The Config tab that is visible prior to executing the export process, contains options to help customize the export.

 - **Messages Per Page** - The number of messages that will be part of a given exported page.
 - **Download Media** - The types of media that should be downloaded and included in the exported files.
	 - **Discord** - Media that is stored on Discord itself.
		 - **Images**
		 - **Video**
		 - **Audio**
	-	**Embedded** - Media that is stored externally.
		-	**Images**
		-	**Video**
 - **Preview Media (HTML)** - The types of media that should be previewed in any resulting HTML.
 	 - **Discord** - Media that is stored on Discord itself.
		 - **Images**
		 - **Video**
		 - **Audio**
	-	**Embedded** - Media that is stored externally.
		-	**Images**
		-	**Video**
 - **Image Display Mode (HTML)** - How images should be displayed in HTML exports.
	 - **Hover, Safe Resolution** - Images upon hover, will grow to a limited but safe resolution (not exceeding 400 x 400).
	 - **Hover, Full Resolution** - Images upon hover, will grow to their full resolution.
	 - **No Hover, Safe Resolution** - Images by default will be displayed in a safe resolution (not exceeding 400 x 400).
	 - **No Hover, Full Resolution** - Images by default will be displayed in their full resolution.
 - **Separate Thread/Forum Posts** - Determines whether messages belonging to a Thread or Forum Post, will be separated into their own respective folders for the export.
 - **Artist Mode** - Determines whether media that is downloaded as part of the export, will be grouped into folders named for their posting User.

After setting the desired export configuration, you can now click the Export button and see the list of file format options.

<img width="400px" src="https://i.imgur.com/m87GJvx.png">

 - **JSON** - Each page of messages will be stored in JSON format.
 - **HTML** - Each page of messages will be stored in HTML format.
	 - *This is the most common and visually appealing export option.*
 - **CSV** - Each page of messages will be stored in CSV format.
 - **Media Only** - Only media will be included as part of the export,  ensure that the **Download Media** configuration option is properly set when using this export option.

After selecting your export option, the extension will work to package up the messages, and download media as necessary. 

When the export process is completed you should receive a ZIP archive that contains the exported data.

It is advisable to extract the contents of the archive into a new folder, using software like [7-Zip](https://www.7-zip.org/), failure to do so can result in images not being displayed properly in HTML exports.
