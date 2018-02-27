/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import CoreMapWrapperCesium from "_core/utils/MapWrapperCesium";

/**
 * Wrapper class for Cesium
 *
 * @export
 * @class MapWrapperCesium
 * @extends {MapWrapper}
 */
export default class MapWrapperCesium extends CoreMapWrapperCesium {
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
}
