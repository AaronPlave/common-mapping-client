/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import Ol_Map from "ol/map";
import Ol_View from "ol/view";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Layer_Tile from "ol/layer/tile";
import Ol_Source_WMTS from "ol/source/wmts";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Source_XYZ from "ol/source/xyz";
import Ol_Tilegrid_WMTS from "ol/tilegrid/wmts";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style from "ol/style/style";
import Ol_Style_Text from "ol/style/text";
import Ol_Style_Circle from "ol/style/circle";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Proj from "ol/proj";
import Ol_Proj_Projection from "ol/proj/projection";
import Ol_Interaction from "ol/interaction";
import Ol_Interaction_Draw from "ol/interaction/draw";
import Ol_Interaction_DoubleClickZoom from "ol/interaction/doubleclickzoom";
import Ol_Overlay from "ol/overlay";
import Ol_Feature from "ol/feature";
import Ol_Geom_Circle from "ol/geom/circle";
import Ol_Geom_Linestring from "ol/geom/linestring";
import Ol_Geom_Polygon from "ol/geom/polygon";
import OL_Geom_GeometryType from "ol/geom/geometrytype";
import Ol_Format_GeoJSON from "ol/format/geojson";
import Ol_Format_TopoJSON from "ol/format/topojson";
import Ol_Format_KML from "ol/format/kml";
import Ol_Easing from "ol/easing";
import proj4js from "proj4";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MapWrapper from "_core/utils/MapWrapper";
import MiscUtil from "_core/utils/MiscUtil";
import MapUtil from "_core/utils/MapUtil";
import TileHandler from "_core/utils/TileHandler";
import Cache from "_core/utils/Cache";
import tooltipStyles from "_core/components/Map/MapTooltip.scss";
import CoreMapWrapperOpenlayers from "_core/utils/MapWrapperOpenlayers";

/**
 * Extension of Openlayers Map Wrapper
 *
 * @export
 * @class MapWrapperOpenlayers
 * @extends {MapWrapperOpenlayers}
 */
export default class MapWrapperOpenlayers extends CoreMapWrapperOpenlayers {
    /**
     * Bring layer into view
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @memberof MapWrapperOpenlayers
     * @returns {boolean} true if zooming succeeds
     */
    zoomToLayer(layer) {
        try {
            let mapSize = this.map.getSize() || [];
            this.map.getView().fit(layer.getIn(["wmtsOptions", "extents"]).toJS(), {
                size: mapSize,
                duration: 1000,
                constrainResolution: false
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.zoomToLayer:", err);
            return false;
        }
    }

    /**
     * set the view bounding box extent of the map
     *
     * @param {array} extent [minX, minY, maxX, maxY] of the desired extent
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapperOpenlayers
     */
    setExtent(extent) {
        try {
            if (extent) {
                extent = Ol_Proj.transformExtent(
                    extent,
                    "EPSG:4326",
                    this.map
                        .getView()
                        .getProjection()
                        .getCode()
                );
                let mapSize = this.map.getSize() || [];
                this.map.getView().fit(extent, {
                    size: mapSize,
                    constrainResolution: false
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.setExtent:", err);
            return false;
        }
    }

    /**
     * get the current view bounding box of the map
     *
     * @returns {array} [minX, minY, maxX, maxY] of the current extent
     * @memberof MapWrapperOpenlayers
     */
    getExtent() {
        try {
            let extent = this.map.getView().calculateExtent(this.map.getSize());
            return Ol_Proj.transformExtent(
                extent,
                this.map
                    .getView()
                    .getProjection()
                    .getCode(),
                "EPSG:4326"
            );
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getExtent:", err);
            return false;
        }
    }
}
