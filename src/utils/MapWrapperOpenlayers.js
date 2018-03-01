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
import Ol_Geom_GeometryType from "ol/geom/geometrytype";
import Ol_Geom_Point from "ol/geom/point";
import Ol_Format_GeoJSON from "ol/format/geojson";
import Ol_Format_TopoJSON from "ol/format/topojson";
import Ol_Format_KML from "ol/format/kml";
import Ol_Easing from "ol/easing";
import proj4js from "proj4";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import appConfig from "constants/appConfig";
import MapWrapper from "_core/utils/MapWrapper";
import MiscUtil from "_core/utils/MiscUtil";
import MapUtil from "utils/MapUtil";
import TileHandler from "_core/utils/TileHandler";
import Cache from "_core/utils/Cache";
import tooltipStyles from "_core/components/Map/MapTooltip.scss";
import MapWrapperOpenlayersCore from "_core/utils/MapWrapperOpenlayers";

/**
 * Extension of Openlayers Map Wrapper
 *
 * @export
 * @class MapWrapperOpenlayers
 * @extends {MapWrapperOpenlayers}
 */
export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {
    /**
     * Initialize static class references for this instance
     *
     * @param {string|domnode} container the container to render this map into
     * @param {object} options view options for constructing this map wrapper (usually map state from redux)
     * @memberof MapWrapperOpenlayers
     */
    initStaticClasses(container, options) {
        MapWrapperOpenlayersCore.prototype.initStaticClasses.call(this, container, options);
        this.mapUtil = MapUtil;
    }

    /**
     * creates an openlayers xyz layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * - layer - {string} layer identifier
     * - format - {string} tile resouce format
     * - requestEncoding - {string} url encoding (REST|KVP)
     * - matrixSet - {string} matrix set for the tile pyramid
     * - projection - {string} projection string
     * - extents - {array} bounding box extents for this layer
     * - tilePixelRatio - {array} bounding box extents for this layer
     * - tileGrid - {object} of tiling options
     *   - origin - {array} lat lon coordinates of layer upper left
     *   - resolutions - {array} list of tile resolutions
     *   - matrixIds - {array} identifiers for each zoom level
     *   - tileSize - {number} size of the tiles
     * @returns {object} openlayers source object
     * @memberof MapWrapperOpenlayers
     */
    createXYZSource(layer, options) {
        return new Ol_Source_XYZ({
            url: options.url,
            // tilePixelRatio: 2,
            projection: options.projection,
            maxZoom: options.tileGrid.maxZoom,
            minZoom: options.tileGrid.minZoom,
            tileSize: options.tileGrid.tileSize,
            transition: appConfig.DEFAULT_TILE_TRANSITION_TIME,
            crossOrigin: "anonymous",
            wrapX: true
        });
    }

    /**
     * Bring layer into view
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @memberof MapWrapperOpenlayers
     * @returns {boolean} true if zooming succeeds
     */
    zoomToLayer(layer) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", layer.get("id"));
            if (mapLayer) {
                let mapSize = this.map.getSize() || [];
                this.map.getView().fit(mapLayer.getExtent() || mapLayer.getSource().getExtent(), {
                    size: mapSize,
                    duration: 1000,
                    padding: [100, 100, 100, 100],
                    constrainResolution: false
                });
                return true;
            }
            return false;
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

    /**
     * get the lat-lon corresponding to a given pixel position
     * within the containing domnode
     *
     * @param {array} pixel location in the container [x,y]
     * @returns {object|boolean} object of position of false if it fails
     * - lat - {number} latitude of the pixel location
     * - lon - {number} longitude of the pixel location
     * - isValid - {boolean} pixel was on the globe
     * @memberof MapWrapperOpenlayers
     */
    getLatLonFromPixelCoordinate(pixel) {
        try {
            let coordinate = this.map.getCoordinateFromPixel(pixel);
            coordinate = Ol_Proj.transform(
                coordinate,
                this.map
                    .getView()
                    .getProjection()
                    .getCode(),
                "EPSG:4326"
            );
            let constrainCoordinate = this.mapUtil.constrainCoordinates(coordinate);
            if (
                typeof constrainCoordinate[0] !== "undefined" &&
                typeof constrainCoordinate[1] !== "undefined" &&
                !isNaN(constrainCoordinate[0]) &&
                !isNaN(constrainCoordinate[0])
            ) {
                return {
                    lat: constrainCoordinate[0],
                    lon: constrainCoordinate[1],
                    isValid: coordinate[1] <= 90 && coordinate[1] >= -90
                };
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getLatLonFromPixelCoordinate:", err);
            return false;
        }
    }

    /**
     * create an openlayers vector layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {boolean} [fromCache=true] true if the layer may be pulled from the cache
     * @returns {object} openlayers vector layer
     * @memberof MapWrapperOpenlayers
     */
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
                    style: this.createVectorLayerStyle(layer)
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

    /**
     * creates an openlayers kml vector layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * @returns {object} openlayers source object
     * @memberof MapWrapperOpenlayers
     */
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

    /**
     * creates a vector styling function for a layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {function} openlayers style function object
     * @memberof MapWrapperOpenlayers
     */
    createVectorLayerStyle(layer) {
        switch (layer.get("vectorStyle")) {
            case appStrings.VECTOR_STYLE_STORM:
                return this.createVectorLayerStyleStorm(layer);
            default:
                return undefined;
        }
    }

    /**
     * creates a vector styling function for a storm track
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {function} openlayers style function object
     * @memberof MapWrapperOpenlayers
     */
    createVectorLayerStyleStorm(layer) {
        return (feature, resolution) => {
            let nodeTime = feature.get("dtg");
            let time = moment(nodeTime, layer.get("timeFormat"));
            let timeStr = time.format("MMM DD · HH:mm UTC");
            let color = this.mapUtil.getStormColor(parseInt(feature.get("intensity")));

            let textStyle = new Ol_Style_Text({
                font: "12px Roboto, sans-serif",
                overflow: true,
                offsetX: 10,
                textAlign: "left",
                text: timeStr,
                fill: new Ol_Style_Fill({
                    color: "#000"
                }),
                stroke: new Ol_Style_Stroke({
                    color: "#fff",
                    width: 3
                })
            });

            let pointStyle = new Ol_Style_Circle({
                fill: new Ol_Style_Fill({ color: color }),
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

    /**
     * retrieves an array of feature data at a given coordinate/pixel
     *
     * @param {array} coords [lon,lat] map coordinates
     * @param {array} pixel  [x,y] screen coordinates
     * @returns {array} feature data objects
     * - layerId - {string} id of the layer this feature belongs to
     * - properties - {object} data properties of the feature (intensity, minSeaLevelPres, dtg)
     * - coords - {array} [lon,lat] map coordinates of the feature
     * @memberof MapWrapperOpenlayers
     */
    getDataAtPoint(coords, pixel) {
        try {
            let data = []; // the collection of pixel data to return
            let mapLayers = this.map.getLayers(); // the layers to search
            this.map.forEachFeatureAtPixel(
                pixel,
                (feature, mapLayer) => {
                    if (mapLayer) {
                        if (feature.getGeometry() instanceof Ol_Geom_Point) {
                            data.push({
                                layerId: mapLayer.get("_layerId"),
                                properties: {
                                    intensity: parseInt(feature.get("intensity")),
                                    minSeaLevelPres: parseInt(feature.get("minSeaLevelPres")),
                                    dtg: feature.get("dtg")
                                },
                                coords: [
                                    parseFloat(feature.get("lon")),
                                    parseFloat(feature.get("lat"))
                                ]
                            });
                            return false;
                        }
                    }
                },
                undefined,
                mapLayer => {
                    return (
                        mapLayer.getVisible() &&
                        mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA
                    );
                }
            );

            // pull just one feature to display
            return data.slice(0, 1);

            // return data;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getDataAtPoint:", err);
            return [];
        }
    }
}
