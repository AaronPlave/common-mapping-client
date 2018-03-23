# Modifying Layer Configurations - Part 2

As we saw in \[Modifying layer configurations\]\(INSERT LINK HERE\) for WMTS Image layers, all non-default layer configurations primarily reside in `layers.json` . So let's go ahead and add a new layer entry for this storm track.

In `layers.json` , add the following entry:

```
{
    "layers": [
        ...
        {
            "id": "storm_track_hurricane_maria",
            "title": "Hurricane Maria - Storm Track",
            "type": "data",
            "handleAs": "vector_kml",
            "vectorStyle": "storm",
            "updateParameters": { "time": false },
            "url": "default-data/demo-default-data/al152017_best_track_Maria.kml",
            "timeFormat": "YYYY MMM DD HHmm"
        },
        ...   
    ]
}
```

`"handleAs": "vector_kml"` will signal our MapWrapper classes to parse this layer as a KML and to render it as a vector. `"timeFormat": "YYYY MMM DD HHmm"` is a format string for [Moment.Js](http://momentjs.com) which is the library CMC uses for date parsing and manipulation. `"updateParameters"` is a set of predefined parameters for which a layer might be updated. In this case, we are setting `time` to `false` so that when the app changes date, it will not attempt to update this layer (we will change this later). `"vectorStyle": "storm"` will signal our MapWrapper classes to use a specific styling strategy when rendering this layer. Note that `"vectorStyle"` is not part of the CMC layer model and in fact will do nothing until we create new functions to handle it in the following sections. Because CMC uses [ImmutableJS](https://facebook.github.io/immutable-js/) to merge all of the layer configurations together, it's ok that `"vectorStyle"` doesn't exist in the CMC Core layer model, this field will simply be added to this layer's data structure and for all other layers it will be read as `undefined`.

## Avioding Mispellings

Later, we will be using the `vectorStyle: "storm"` to match this layer and customize it's rendering on the map. That means we'll need to match the string "storm" exactly, so let's store that string in a constants file so we can access it programmatically.

Create and edit the following file: `src/constants/appStrings.js`

```js
export const VECTOR_STYLE_STORM = "storm";
```

Save your changes and refresh your browser. You should now see a layer control entry for "Hurricane Maria - Storm Track", however enabling it will likely do nothing except spit out some errors as we did not import the image sprites for the Placemarks in the KML.

