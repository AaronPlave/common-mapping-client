# Adding Layer Configurations

We'll now move on to adding the map layer configurations so that we can ingest and display these layers on our 2D and 3D maps. Inside of this new `demo-default-data` we'll take a look at two files: `capabilities.xml` and `layers.json`.

Let's take a look at `layers.json` first. We'll use this configuration to construct most of the required information CMC needs to ingest and manage the map layers we want to add. Inside our `layers.json` file we'll see all of the default CMC layers. This is where we'll start substituting our own layers, but first we need to know which layers to use.

## Leveraging MarsTrek layers

If we do a little digging into the [Mars Trek application](https://marstrek.jpl.nasa.gov/#) we can determine where the map tiles are being requested from and eventually end up [here](http://mars-2035432769.us-west-1.elb.amazonaws.com/catalog/layers/all/index.html) at an overview of the map layers being served.

- talk about grabbing tile matrix sets from MarsTrek capabilities file, adding corresponding sets to our capabilities file, short note about why we have this local capabilities (could come from a server) and how it gets ingested/merged with layers.json
- talk about figuring out min/max zoom, tile size, projection
- walk through creating a layer based off of the full layer model, defined in `layerModel` inside `src/_core/reducers/models/map.js`, so id, title, metadata (to be explained in a later section), thumbnail, default on/off, handle as, type (data/basemap/ref, etc)

## Adding place label

- Grabbing nomenclature from USGS (need link), changing it from kmz to kml, adding it to default data, adding the layer to layers.json (and not capabilities) (note here how style will look bad, will fix this in a later section).
- Hooking into the CMC place label button - since it's designed for places and boundaries out of the box we can just tell it for now that those two things are the same layer. This will suppress the warning although it would be a little cleaner to just extend the button and change what is being activated.

