# Adding Layer Metadata

Now that we have the right layers showing up on the map let's add some metadata to our layers so that we can populate the layer information pages. These layer info pages can be accessed for data layers by clicking on the information icons on the right side of each layer in map controls. To add metadata for these layers we'll need to grab metadata from MarsTrek, add this metadata into our `demo-default-data`, and give our data layers the correct paths to their corresponding metadata files.
- Note: basemap and place labels don't have an info flyout since they aren't data layers, you'd have to add some other way to do this or change them into data layers.


## Finding layer metadata in MarsTrek

Over in MarsTrek we can search for the data layers we've added to our application using their search functionality. Once we've located this information we can copy it over to our app.

## Adding layer metadata files

Under `src/default-data/demo-default-data/layer-metadata` we'll see a bunch of json files that we copied over from CMC Core. We won't need these anymore but you can save one to use as a template.
- Talk about core layer info component as ref to how this stuff will be used

## Specifying layer metadata paths in layers

- Give path to json files
```JSON
"metadata": {
            "url":
            "default-data/demo-default-data/layer-metadata/Mars_MGS_MOLA_ClrShade_merge_global_463m.json",
            "handleAs": "json"
}
```

Now reload and try to open the layer info for one of the data layers
