/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import moment from "moment";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style from "ol/style/style";
import Ol_Style_Circle from "ol/style/circle";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Proj from "ol/proj";
import Ol_Geom_Point from "ol/geom/point";
import Ol_Format_KML from "ol/format/kml";
import Ol_Easing from "ol/easing";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import appConfig from "constants/appConfig";
import MapUtil from "utils/MapUtil";
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
                let extents =
                    typeof mapLayer.getSource().getExtent === "function"
                        ? mapLayer.getSource().getExtent()
                        : Ol_Proj.transformExtent(
                              layer.getIn(["wmtsOptions", "extents"]).toJS(),
                              layer.getIn(["wmtsOptions", "projection"]),
                              this.map
                                  .getView()
                                  .getProjection()
                                  .getCode()
                          );

                this.map.getView().fit(extents, {
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
     * update a layer on the map. This creates a new layer
     * and replaces the layer with a matching id
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapperOpenlayers
     */
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
                    // update the layer
                    this.setLayerRefInfo(layer, mapLayer);

                    let date = moment(mapLayer.get("_layerTime"), layer.get("timeFormat")).startOf(
                        "d"
                    );
                    let nextDate = moment(date).add(1, "d");
                    mapLayer.getSource().forEachFeature(feature => {
                        let featureTime = moment(feature.get("dtg"), layer.get("timeFormat"));
                        if (featureTime.isBetween(date, nextDate, null, "[)")) {
                            let category = this.mapUtil.getStormCategory(
                                parseInt(feature.get("intensity"))
                            );
                            feature.setStyle([
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
                            ]);
                        } else {
                            feature.setStyle(null);
                        }
                    });
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
                    style: this.createVectorLayerStyle(layer),
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
