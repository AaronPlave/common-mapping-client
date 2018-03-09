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

We don't want our new MapWrapper class to always do all the rendering for vector layers, instead we want to pass rendering all vector layers except our new type of vector, which includes a custom style, back to the parent class. So let's add a check for our specific type of vector and delegate the rest to the parent. Remember that when we added this layer to `layers.json` , we set the `vectorStyle` to be "storm", we'll use that `vectorStyle` key as our guide here.

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



