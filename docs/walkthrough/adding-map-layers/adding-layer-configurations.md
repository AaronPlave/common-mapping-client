# Modifying Layer Configurations - Part 1

We'll now move on to adding the map layer configurations so that we can ingest and display these layers on our 2D and 3D maps. Inside of this new `demo-default-data` we'll be modifying two files: `capabilities.xml` and `layers.json`.

Before that though, let's try to untangle what exactly these files are doing. First, let's look at `src/_core/reducers/models/map.js`. Inside, you'll find an export for `layerModel.`That variable defines the base data structure for all layer objects in this application. The layer configurations `layers.json` and `capabilities.xml` together define the specific values for each layer in this application. Note that when a field is not defined in either `layers.json` or `capabilities.xml` the default value from this data structure is used. With that in mind, let's look at `layers.json`.

`layers.json`provides almost all of the information required to display these layers however it generally lacks WMTS specific information. Now let's look at `capabilities.xml`. If you are quite versed in WMTS you may recognize this as the result of a call to GetCapabilities and you would be right. This file was constructed from a subset of layers offered by [GIBS](https://gibs.earthdata.nasa.gov/). Now, let's pick some new layers for this application.

## Leveraging Existing Services - GIBS

For this walkthrough, we'll pull our data layers from GIBS as well. First let's load their [GetCapabilities endpoint](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml) for reference and then let's open another application called [WorldView](https://worldview.earthdata.nasa.gov/) which will let us visually explore GIBS' offerings. Since we are planning on an application that will relate to Hurricane Maria, let's pull in the following layers:

* Corrected Reflectance \(True Color\) - VIIRS

* Surface Precipitation Rate \(Night\) - AMSR2

* Surface Precipitation Rate \(Day\) - AMSR2

* Sea Surface Temperature \(L4, G1SST\) - GHRSST

## layers.json

We'll use the output from the GetCapabilities to find the Identifier for each of these layers and from there we can create a new list of layers for `layers.json` . First, let's remove all of the entries that have `"type": "data"` in `layers.json` except for the VIIRS True Color and GHRSST Sea Surface Temperature. For the Sea Surface Temperature and True Color layers, we should have the following configuration:

```
{
  "layers": [
    ...
    {
        "id": "VIIRS_SNPP_CorrectedReflectance_TrueColor",
        "title": "True Color",
        "type": "data",
        "handleAs": "GIBS_raster",
        "wmtsOptions": {
            "urlFunctions": {
                "openlayers": "kvpTimeParam",
                "cesium": "kvpTimeParam"
            }
        },
        ...
    },
    {
        "id": "GHRSST_L4_G1SST_Sea_Surface_Temperature",
        "title": "Sea Surface Temperature",
        "type": "data",
        "handleAs": "GIBS_raster",
        "wmtsOptions": {
            "urlFunctions": {
                "openlayers": "kvpTimeParam",
                "cesium": "kvpTimeParam"
            }
        },
        ...
    },
    ...  
  ]
}
```

Those `id` fields will matchup with the identifiers in the GetCapabilities and CMC will then fill in the WMTS specific information \(matrixset, tilegrid, etc\) from that. The `"type": "data"` lines indicate that these layers are part of the set of layers that should be displayed in the main menu of the application as data as opposed to being displayed elsewhere in the application as a basemap or a reference layer \(e.g. place labels\). The values under `urlFunctions` specify that each tile url generated for these layers should be handled by a built in function in CMC's `TileHandler` class that will add a date to each query. Note that this is specified on a per-mapping library basis as each library is a little different in how it handles tile requests. The additional fields \(`metadata`, `thumbnail`, etc are not strictly necessary for basic display so we'll ignore them for now\).

For the other two layers, we'll do something a little different, we'll dynamically re-project the tiles from EPSG:4326 to WebMercator. To do so, we'll add the following configurations to `layers.json`

```
{
    "layers": [
    ...
    {
            "id": "AMSR2_Surface_Precipitation_Rate_Day_EPSG4326",
            "title": "Surface Precipitation Rate (Day, AMSR2, GCOM-W1)",
            "type": "data",
            "handleAs": "GIBS_raster",
            "wmtsOptions": {
                "matrixSet": "2km",
                "url": "https://map1a.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi",
                "projection": "EPSG:4326",
                "layer": "AMSR2_Surface_Precipitation_Rate_Day",
                "tileGrid": {
                    "matrixIds": [0, 1, 2, 3, 4, 5],
                    "tileSize": 512
                },
                "urlFunctions": {
                    "openlayers": "kvpTimeParam",
                    "cesium": "kvpTimeParam"
                }
            }
        },
        {
            "id": "AMSR2_Surface_Precipitation_Rate_Night_EPSG4326",
            "title": "Surface Precipitation Rate (Night, AMSR2, GCOM-W1)",
            "type": "data",
            "handleAs": "GIBS_raster",
            "wmtsOptions": {
                "matrixSet": "2km",
                "url": "https://map1a.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi",
                "projection": "EPSG:4326",
                "layer": "AMSR2_Surface_Precipitation_Rate_Night",
                "tileGrid": {
                    "matrixIds": [0, 1, 2, 3, 4, 5],
                    "tileSize": 512
                },
                "urlFunctions": {
                    "openlayers": "kvpTimeParam",
                    "cesium": "kvpTimeParam"
                }
            }
        }
    ...
    ]
}
```

Notice that for these layers, we have modified the `id` for each to be slightly different from what would be found in the GetCapabilities output. This is done so that a match _will not_ be found between the configurations and thus the information from GetCapabilities \(which has WebMercator information\) will not impact the EPSG:4326 specific information we define here. Because we are not pulling any configuration information from GetCapabilities, we must define more WMTS specific parameters for these layers.

Note that our `handleAs` for all these layers has been `"GIBS_raster"` . This is done because CMC includes some default configuration options specific to GIBS layers that make use of their layers a little easier. For WMTS layers not coming from GIBS, you may want to use `"handleAs": "wmts_raster"`

## Loading the New Configurations

Now that we have some new layers for the application to use, we'll adjust the configuration so that they are actually used. Open `src/constants/appConfig.js` and set the following:

```
const APP_CONFIG = Immutable.fromJS({
    ...
    URLS: {
        layerConfig: [
            {
                url: "//gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml",
                type: "wmts/xml"
            },
            {
                url: "default-data/demo-default-data/layers.json",
                type: "json"
            }
        ]
    }
    ...
});
```

This will set the application to load the new `layers.json` file and the full GIBS GetCapabilities instead of the CMC default versions of each.

Save your work and refresh the application. You should now see and interact with the four layers in the Map Layers menu.

