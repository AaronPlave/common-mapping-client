# Rendering the Storm Track in Openlayers

Rendering a layer in the MapWrapper class is done by calling the `setLayerActive` function. That function will attempt to create a new Openlayers layer object if it doesn't have one cached and add it to the map. Following the path of this function for our `handleAs: "vector_kml"` layer, we will come upon the `createVectorLayer` and `createVectorKMLSource` functions. These functions create a new [Openlayers Vector Source](https://openlayers.org/en/latest/apidoc/ol.source.Vector.html) and an [Openlayers Vector Layer](https://openlayers.org/en/latest/apidoc/ol.layer.Vector.html). For KML layers, Openlayers will attempt to use the styles built into the KML by default. So we must override `createVectorKMLSource` to create a source that does not use the built-in styles and override the `createVectorLayer` function to use the new source type and apply a new set of styles.

All of the following edits shall be made to `utils/MapWrapperOpenlayers.js` unless otherwise noted

## Placeholder Stuff

Start by adding the following imports to the top of the file:

```
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style from "ol/style/style";
import Ol_Style_Circle from "ol/style/circle";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Geom_Point from "ol/geom/point";
import Ol_Format_KML from "ol/format/kml";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import appConfig from "constants/appConfig";
```

Next we'll copy-paste the `createVectorLayer` and `createVectorKMLSource` functions from the CMC Core MapWrapperOpenlayers class

```
export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {
    ...
    createVectorLayer(layer, fromCache = true) {
        try {
            let layerSource = this.createLayerSource(layer, {
                url: layer.get("url")
            });
            if (layer.get("clusterVector")) {
                layerSource = new Ol_Source_Cluster({ source: layerSource });
            }
    
            return new Ol_Layer_Vector({
                source: layerSource,
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                extent: appConfig.DEFAULT_MAP_EXTENT
            });
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorLayer:", err);
            return false;
        }
    }
    createVectorKMLSource(layer, options) {
        // customize the layer url if needed
        if (
            typeof options.url !== "undefined" &&
            typeof layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D]) !== "undefined"
        ) {
            let urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D])
            );
            options.url = urlFunction({
                layer: layer,
                url: options.url
            });
        }
    
        return new Ol_Source_Vector({
            url: options.url,
            format: new Ol_Format_KML()
        });
    }
    ...
}
```

## Parent Delegation

We don't want our new MapWrapper class to handle vector layers rendering. Instead we want to rely on the parent class to render all vectors except for our new type of vector, which includes a custom style. So let's add a check for our specific type of vector and delegate the rest to the parent. Remember that when we added this layer to `layers.json`  we set the `vectorStyle` to be "storm", we'll use that `vectorStyle` key as our guide here.

```
createVectorLayer(layer, fromCache = true) {
    if (typeof layer.get("vectorStyle") !== "undefined") {
        try {
            let layerSource = this.createLayerSource(layer, {
                url: layer.get("url")
            });
            if (layer.get("clusterVector")) {
                layerSource = new Ol_Source_Cluster({ source: layerSource });
            }

            return new Ol_Layer_Vector({
                source: layerSource,
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                extent: appConfig.DEFAULT_MAP_EXTENT
            });
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorLayer:", err);
            return false;
        }
    } else {
        return MapWrapperOpenlayersCore.prototype.createVectorLayer.call(
            this,
            layer,
            fromCache
        );
    }
}
```

## Disable Built-In KML Styles

Next, we'll change the KML parsing behavior to ignore built-in styles for layers with the `vectorStyle` attribute

```
createVectorKMLSource(layer, options) {
    // customize the layer url if needed
    if (
        typeof options.url !== "undefined" &&
        typeof layer.getIn(["urlFunctions", appStringsCore.MAP_LIB_2D]) !== "undefined"
    ) {
        let urlFunction = this.tileHandler.getUrlFunction(
            layer.getIn(["urlFunctions", appStringsCore.MAP_LIB_2D])
        );
        options.url = urlFunction({
            layer: layer,
            url: options.url
        });
    }

    return new Ol_Source_Vector({
        url: options.url,
        format: new Ol_Format_KML({
            extractStyles: typeof layer.get("vectorStyle") === "undefined"
        })
    });
}
```

## Creating a New Vector Style

Now we'll create some functions that will create Openlayers vector stylings for the storm track using data stored in KML to customize each point. Looking inside the KML at the `<ExtendedData>` for each point, we see that it includes an `intensity` measurement in knots. Using that as our target, we'll color each point according to the wind speed intensity measured at that location. Let's start by creating a function that maps wind speed to a storm categorization and color. Consulting [Wikipedia](https://en.wikipedia.org/wiki/Saffir%E2%80%93Simpson_scale) will give us the value range breakdown.

Add the following to `src/constants/appStrings.js`.
```
...
export const STORM_CATEGORIES = {
    tropical_depression: { color: "#1976d2", textColor: "black", label: "Tropical Depression" },
    tropical_storm: { color: "#26c6da", textColor: "white", label: "Tropical Storm" },
    cat_1: { color: "#ffee58", textColor: "black", label: "Category 1 Hurricane" },
    cat_2: { color: "#ffca28", textColor: "black", label: "Category 2 Hurricane" },
    cat_3: { color: "#ffb300", textColor: "black", label: "Category 3 Hurricane" },
    cat_4: { color: "#fb8c00", textColor: "white", label: "Category 4 Hurricane" },
    cat_5: { color: "#e53935", textColor: "white", label: "Category 5 Hurricane" }
};
...
```
This is just a mapping of storm categories to a representative color, label, and contrasting text color (to be used later).


Now, create and edit `src/utils/MapUtil.js`

```
import MapUtilCore from "_core/utils/MapUtil";
import * as appStrings from "constants/appStrings";

export default class MapUtil extends MapUtilCore {
    static getStormCategory(intensity) {
        if (intensity <= 33) {
            return appStrings.STORM_CATEGORIES.tropical_depression;
        } else if (intensity > 33 && intensity <= 63) {
            return appStrings.STORM_CATEGORIES.tropical_storm;
        } else if (intensity > 63 && intensity <= 82) {
            return appStrings.STORM_CATEGORIES.cat_1;
        } else if (intensity > 82 && intensity <= 95) {
            return appStrings.STORM_CATEGORIES.cat_2;
        } else if (intensity > 95 && intensity <= 112) {
            return appStrings.STORM_CATEGORIES.cat_3;
        } else if (intensity > 112 && intensity <= 136) {
            return appStrings.STORM_CATEGORIES.cat_4;
        } else if (intensity > 136) {
            return appStrings.STORM_CATEGORIES.cat_5;
        }

        return { color: "#ffffff", label: "Category not found", textColor: "black" };
    }
}
```
This new MapUtil class extends the CMC Core MapUtil class and adds a function that takes a wind speed measurement in knots and returns the appropriate color/label entry we stored in `src/constants/appStrings.js` or a `Category not found` entry if there was not match.

Let's turn back to `src/utils/MapWrapperOpenlayers.js` to make use of our new intensity-to-color functions. Add the following functions:

```
...
createVectorLayerStyle(layer) {
    switch (layer.get("vectorStyle")) {
    case appStrings.VECTOR_STYLE_STORM:
        return this.createVectorLayerStyleStorm(layer);
    default:
        return undefined;
    }
}

createVectorLayerStyleStorm(layer) {
    return (feature, resolution) => {
        let category = this.mapUtil.getStormCategory(parseInt(feature.get("intensity")));

        let pointStyle = new Ol_Style_Circle({
            fill: new Ol_Style_Fill({ color: category.color }),
            stroke: new Ol_Style_Stroke({
                color: "#000",
                width: 1.25
            }),
            radius: 6
        });

        return new Ol_Style({
            image: pointStyle
        });
    };
}
...
```
`createVectorLayerStyle` will let us expand our custom style options down the road if we desire by taking a layer object from state and return an [Openlayers Style Function](https://openlayers.org/en/latest/apidoc/ol.html#.StyleFunction) for rendering a vector layer. `createVectorLayerStyleStorm` specifically will look for the `intensity` property of each point and render a circle colored according to the `MapUtil.getStormCategory` inversion. Now, let's use these functions in the rendering of our storm track layer.

Modify `createVectorLayer`:

```
...
createVectorLayer(layer, fromCache = true) {
    if (typeof layer.get("vectorStyle") !== "undefined") {
        try {
        ...
            return new Ol_Layer_Vector({
                source: layerSource,
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                style: this.createVectorLayerStyle(layer),
                extent: appConfig.DEFAULT_MAP_EXTENT
            });
        } catch (err) {
            ...
        }
    } else {
     ...
    }
}
...
```
Notice that we added `style: this.createVectorLayerStyle(layer)`.

Save your work and refresh your browser. Now when you turn on the storm track, the points should show up and be colored according to their wind speed intensity.