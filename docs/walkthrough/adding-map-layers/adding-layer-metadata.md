# Adding Layer Metadata

Now that we have the right layers showing up on the map let's add some metadata to our layers so that we can populate the layer information pages. These layer info pages can be accessed for data layers by clicking on the information icons on the right side of each layer in map controls. To add metadata for these layers we'll need to grab some information from places like Worldview, add this metadata into our `demo-default-data`, and give our data layers the correct paths to their corresponding metadata files. Note: basemap and place labels don't have an info flyout since they aren't data layers, you'd have to add some other way to do this or change them into data layers.


## Adding layer metadata files

Under `src/default-data/demo-default-data/layer-metadata` we'll see a bunch of json files that we copied over from CMC Core. We won't need these anymore but you can save one to use as a template. Each json file contains a few pieces of metadata such as title, description, etc., that we can use to populate the core layer info component.

## Adding layer thumbnails

Once we've created a metadata json file for all of our data layers the next step is to create a few image previews of these layers for use in the layer info component. Some of our data layers came from CMC Core so we can re-use some existing image assets but for the new layers from GIBS and the hurricane track we'll need to take some screenshots and save these images under `styles/resources/img/layer_thumbnails/`. To actually import these images through webpack we'll need to require our new images in `index.js`:
```JS
require("styles/resources/img/layer_thumbnails/storm_track.png");
```
This will make our images available for us to use under the `/img/` directory. Note: The original filenames will persist.


## Specifying layer metadata paths in layers

Finally, we need to configure our layers to actually use these new json files and images. For each of our data layers we want to point the metadata url to the corresponding json we made under `demo-default-data/layer-metadata` and point the thumbnail image to the corresponding thumbnail under `img/`.
```JSON
"metadata": {
            "url": "default-data/demo-default-data/layer-metadata/AMSR2_Surface_Precipitation_Rate_Night_EPSG4326.json",
            "handleAs": "json"
}
...
"thumbnailImage": "img/surface_precipitation_night.png"
...
```

Now reload the page and open the layer info modal for one of the data layers you've added. You should see the new metadata and image thumbnail we just configured for that layer.
