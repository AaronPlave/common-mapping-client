/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import moment from "moment";
import MapWrapperCesiumCore from "_core/utils/MapWrapperCesium";
import MapUtil from "utils/MapUtil";

/**
 * Wrapper class for Cesium
 *
 * @export
 * @class MapWrapperCesium
 * @extends {MapWrapper}
 */
export default class MapWrapperCesium extends MapWrapperCesiumCore {
    /**
     * Initialize static class references for this instance
     *
     * @param {string|domnode} container the container to render this map into
     * @param {object} options view options for constructing this map wrapper (usually map state from redux)
     * @memberof MapWrapperOpenlayers
     */
    initStaticClasses(container, options) {
        MapWrapperCesiumCore.prototype.initStaticClasses.call(this, container, options);
        this.mapUtil = MapUtil;
    }

    /**
     * Bring layer into view
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @memberof MapWrapperCesiumExtended
     * @returns {boolean} true if zooming succeeds
     */
    zoomToLayer(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                this.map.flyTo(mapLayer, {
                    duration: 1,
                    offset: new this.cesium.HeadingPitchRange(0, -90, 0)
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapperCesiumExtended.zoomToLayer:", err);
            return false;
        }
    }

    /**
     * create a vector cesium layer corresponding
     * to the given layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {object|boolean} cesium layer object or false if it fails
     * @memberof MapWrapperCesium
     */
    createVectorLayer(layer) {
        try {
            let layerSource = MapWrapperCesiumCore.prototype.createVectorLayer.call(this, layer);
            if (layerSource) {
                layerSource.then(mapLayer => {
                    let features = mapLayer.entities.values;
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
                });
            }
            return layerSource;
        } catch (err) {
            console.warn("Error in MapWrapperCesium.createVectorLayer:", err);
        }
    }

    /**
     * retrieves an array of feature data at a given coordinate/pixel
     *
     * @param {array} coords [lon,lat] map coordinates
     * @param {array} pixel  [x,y] screen coordinates
     * @returns {array} feature data objects
     * - layerId - {string} id of the layer this feature belongs to
     * - properties - {object} data properties of the feature (intensity, minSeaLevelPres, dtg)
     * - coords - {array} [lon,lat] map coordinates of the feature
     * @memberof MapWrapperCesium
     */
    getDataAtPoint(coords, pixel) {
        try {
            let data = []; // the collection of pixel data to return

            let pickedObjects = this.map.scene.drillPick(
                new this.cesium.Cartesian2(pixel[0], pixel[1]),
                1
            );
            for (let i = 0; i < pickedObjects.length; ++i) {
                let entity = pickedObjects[i];
                if (entity.id.kml && entity.id.kml.extendedData) {
                    data.push({
                        layerId: entity.id._layerId,
                        properties: {
                            intensity: parseInt(entity.id.kml.extendedData.intensity.value),
                            minSeaLevelPres: parseInt(
                                entity.id.kml.extendedData.minSeaLevelPres.value
                            ),
                            dtg: entity.id.kml.extendedData.dtg.value
                        },
                        coords: [
                            parseFloat(entity.id.kml.extendedData.lon.value),
                            parseFloat(entity.id.kml.extendedData.lat.value)
                        ]
                    });
                }
            }

            // pull just one feature to display
            return data.slice(0, 1);

            // return data;
        } catch (err) {
            console.warn("Error in MapWrapperCesium.getDataAtPoint:", err);
            return [];
        }
    }
}
