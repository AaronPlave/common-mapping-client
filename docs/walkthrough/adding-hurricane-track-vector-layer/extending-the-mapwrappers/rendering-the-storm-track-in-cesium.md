# Rendering the Storm Track in Cesium

Rendering a layer in the MapWrapper class is done by calling the `setLayerActive` function. That function will attempt to create a new Cesium layer object and add it to the map. Following the path of this function for our `handleAs: "vector_kml"` layer, we will come upon the `createVectorLayer` function that creates a [Cesium vector source](https://cesiumjs.org/Cesium/Build/Documentation/DataSource.html?classFilter=datasou) (which is really a promise that resolves to a Cesium map layer). For KML layers, Cesium will attempt to use the styles built into the KML by default. So we must override `createVectorLayer` to create a modify the styles of the vector layer once it has been loaded.

All of the following edits shall be made to `utils/MapWrapperCesium.js` unless otherwise noted.

## Placeholder Stuff

Start by adding the following imports to the top of the file:

```js
...
import moment from "moment";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
...
```

Next, we'll override the `createVectorLayer` function and delegate all of it to the parent class.

```js
...
export default class MapWrapperCesium extends MapWrapperCesiumCore {
    ...
    createVectorLayer(layer) {
        return MapWrapperCesiumCore.prototype.createVectorLayer.call(this, layer);
    }
    ...
}
```

Now we can start modifying the rendering for our new vector type.

## Custom KML Vector Style

To begin with, let's create a function that will modify the render style for each point entity in the storm track. Remember that Cesium vector layers are promises that resolve to an [EntityCollection](https://cesiumjs.org/Cesium/Build/Documentation/EntityCollection.html) so what we'll do is create a function that takes the layer object from state, the map layer (Entity Collection) from Cesium, and modifies the render features of each entity on the map. We'll also attach the layer id to each point so that later we can resolve the parent layer from each point.

```js
...
setVectorLayerFeatureStyles(layer, mapLayer) {
    try {
        let features = mapLayer.entities.values;
        if (layer.get("vectorStyle") === appStrings.VECTOR_STYLE_STORM) {
            for (let i = 0; i < features.length; ++i) {
                let feature = features[i];
                feature.billboard = undefined;
                feature.label = undefined;
                feature._layerId = layer.get("id");
                if (feature.kml.extendedData) {
                    let category = this.mapUtil.getStormCategory(
                        parseInt(feature.kml.extendedData.intensity.value)
                    );
                    feature.point = new this.cesium.PointGraphics({
                        color: new this.cesium.Color.fromCssColorString(category.color),
                        pixelSize: 10,
                        outlineWidth: 1.25
                    });
                }
            }
        }
        return true;
    } catch (err) {
        console.warn("Error in MapWrapperCesium.setVectorLayerFeatureStyles:", err);
        return false;
    }
}
...
```

Now we'll go back to `createVectorLayer` and make use of the new style override function

```js
createVectorLayer(layer) {
    try {
        let layerSource = MapWrapperCesiumCore.prototype.createVectorLayer.call(this, layer);
        if (layerSource && typeof layer.get("vectorStyle") !== "undefined") {
            layerSource.then(mapLayer => {
                this.setVectorLayerFeatureStyles(layer, mapLayer);
            });
        }
        return layerSource;
    } catch (err) {
        console.warn("Error in MapWrapperCesium.createVectorLayer:", err);
    }
}
```
Notice we are still delegating the majority of layer creation to the parent class and are only adding a style modification once the data source is loaded.

Save your work and refresh the browser, now you should be able to see the storm track render on the 3D map to match the 2D map.