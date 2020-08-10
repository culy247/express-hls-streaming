this directory is thumbnail img temp storage.
don't remove.
----
state.json file in streamable is check ffmpeg working,

This is to prevent the deletion of video group data if the created value is false.
When deleting a video group while creating a stream file using the ffmpeg module, there may be a problem in the data relationship.
It is used as a safety device to reliably perform streaming file conversion.

While this file is set to false, other streaming file conversion and video group deletion cannot be performed.