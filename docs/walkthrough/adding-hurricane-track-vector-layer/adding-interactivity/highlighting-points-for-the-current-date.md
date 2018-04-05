# Highlighting Points for the Current Date

In CMC, there are two types of changes that can occur for layers on the map. Broadly speaking there are those types of changes that mapping libraries expect to handle (such as opacity changes, ordering changes, etc) and those that they don't (such as changing the date). In the case of the former, our MapWrappers can use built-in functions to modify the layers in place as it were but for the latter, we generally need to do a little more work to abstract the process and often we need to create a new map layer and replace the old one. That process is handled by the `updateLayer` function in the MapWrapper classes. That function takes in a layer object from state, creates a new map layer for it, and replaces the map layer that was previously created for that layer object. Because we are only changing the rendered style of a vector layer, we don't need to go as far as creating a new map layer, but we can take advantage of the existing workflow to make this process easier.

## Quick Update to the Layer Config

You may recall that when we first added the configuration for the storm track layer, we set the following in `src/default-data/demo-default-data/layers.json`

```js
...
{
    "id": "storm_track_hurricane_maria",
    ...
    "updateParameters": { "time": false }
    ...
}
...
```

Remove the `updateParameters` line so that CMC will update this layer when the date changes.

## Highlighting Points in Openlayers

As we have already seen, we can use a function to style each point in the track individually. To begin, we will modify `createVectorLayerStyleStorm` to highlight points that fall within 1 day of the current map date.

Edit `src/utils/MapWrapperOpenlayers.js`

```js
...
import moment from "moment";
...
createVectorLayerStyleStorm(layer) {
    return (feature, resolution) => {
        let category = this.mapUtil.getStormCategory(parseInt(feature.get("intensity")));

        let date = moment(this.mapDate).startOf("d");
        let nextDate = moment(date).add(1, "d");
        let featureTime = moment(feature.get("dtg"), layer.get("timeFormat"));

        if (featureTime.isBetween(date, nextDate, null, "[)")) {
            return [
                new Ol_Style({
                    image: new Ol_Style_Circle({
                        fill: new Ol_Style_Fill({ color: "#000" }),
                        radius: 10
                    }),
                    zIndex: 2
                }),
                new Ol_Style({
                    image: new Ol_Style_Circle({
                        fill: new Ol_Style_Fill({ color: "#fff" }),
                        radius: 9.25
                    }),
                    zIndex: 2
                }),
                new Ol_Style({
                    image: new Ol_Style_Circle({
                        fill: new Ol_Style_Fill({ color: category.color }),
                        stroke: new Ol_Style_Stroke({
                            color: "#000",
                            width: 1.25
                        }),
                        radius: 7.5
                    }),
                    zIndex: 2
                })
            ];
        } else {
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
        }
    };
}
```
Notice that we are using an instance variable `this.mapDate`. That instance variable is declared and managed in the base `MapWrapper` class and is updated by CMC Core in the `setMapDate` map reducer function.

Now we need to override `updateLayer` to trigger a change event that will cause this layer to re-render and thus update the styles of each point when the date changes.

Add the following function to `src/utils/MapWrapperOpenlayers.js`

```js
updateLayer(layer) {
    try {
        if (
            layer.get("handleAs") === appStringsCore.LAYER_VECTOR_KML &&
            layer.get("vectorStyle") === appStrings.VECTOR_STYLE_STORM
        ) {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(
                mapLayers,
                "_layerId",
                layer.get("id")
            );
            if (mapLayer) {
                this.setLayerRefInfo(layer, mapLayer);
                mapLayer.changed();
            }

            return true;
        } else {
            return MapWrapperOpenlayersCore.prototype.updateLayer.call(this, layer);
        }
    } catch (err) {
        console.warn("Error in MapWrapperOpenlayers.updateLayer:", err);
        return false;
    }
}
```
Note that we are again delegating most updates to the parent class and are only handling changes for this specific new type of layer. Notice also our call to `setLayerRefInfo`, you can see this function `src/_core/utils/MapWrapperOpenlayers.js` but essentially it just stores some state information in this map layer for later reference.

## Highlighting Points in Cesium

Cesium's vector styles are handled a little more directly and less abstractly, so for this MapWrapper we will simply modify `updateLayer` to modify the rendered styles of each point that falls in the currently selected date.

Add the following function to `src/utils/MapWrapperCesium.js`

```js
updateLayer(layer) {
    try {
        if (
            layer.get("handleAs") === appStringsCore.LAYER_VECTOR_KML &&
            layer.get("vectorStyle") === appStrings.VECTOR_STYLE_STORM
        ) {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                this.setLayerRefInfo(layer, mapLayer);

                let date = moment(this.mapDate).startOf("d");
                let nextDate = moment(date).add(1, "d");

                let features = mapLayer.entities.values;
                for (let i = 0; i < features.length; ++i) {
                    let feature = features[i];
                    if (feature.kml.extendedData) {
                        feature.point.pixelSize = 10;
                        feature.point.outlineColor = this.cesium.Color.BLACK;

                        let featureTime = moment(
                            feature.kml.extendedData.dtg.value,
                            layer.get("timeFormat")
                        );
                        if (featureTime.isBetween(date, nextDate, null, "[)")) {
                            feature.point.pixelSize = 13;
                            feature.point.outlineColor = this.cesium.Color.WHITE;
                        }
                    }
                }
            }
            return true;
        } else {
            return MapWrapperCesiumCore.prototype.updateLayer.call(this, layer);
        }
    } catch (err) {
        console.warn("Error in MapWrapperCesium.updateLayer:", err);
        return false;
    }
}
```
Again, we delegate all updates to the parent class except for the layers we care about. Cesium doesn't have as sophisticated a styling system as Openlayers so we cannot match the styles exactly, but we can still highlight the points in a similar way.

Now save your work and refresh your browser. Now the points on the map that match the currently selected day should appear larger with a distinct outline.
