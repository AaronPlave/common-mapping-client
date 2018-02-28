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
            this.map.camera.flyTo({
                destination: this.cesium.Rectangle.fromDegrees(
                    ...layer.getIn(["wmtsOptions", "extents"])
                ),
                duration: 1
            });
            return true;
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
                        if (feature.kml.extendedData) {
                            let color = this.mapUtil.getStormColor(
                                parseInt(feature.kml.extendedData.intensity.value)
                            );
                            feature.point = new this.cesium.PointGraphics({
                                color: new this.cesium.Color.fromCssColorString(color),
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
}
