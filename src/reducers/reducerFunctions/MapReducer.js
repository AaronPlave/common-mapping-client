/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import { layerModel, paletteModel } from "_core/reducers/models/map";
import { alert } from "_core/reducers/models/alert";
import MapUtil from "_core/utils/MapUtil";
import MiscUtil from "_core/utils/MiscUtil";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsDemo from "constants/appStrings";
import MapReducer from "_core/reducers/reducerFunctions/MapReducer";
import appConfig from "constants/appConfig";
import { createMap } from "utils/MapCreator";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class MapReducerExtended extends MapReducer {
    static mapUtil = MapUtil;
    static miscUtil = MiscUtil;

    static addMeasurementLabelToGeometry(state, action) {
        let alerts = state.get("alerts");

        // calculate measurement from geometry
        let measurement = this.mapUtil.measureGeometry(action.geometry, action.measurementType);

        // convert measurement to selected scale units and approximate Mars distances
        // The diameter of Mars is roughly 0.532612 times the size of Earth
        // so we'll need to scale our Earth-based measurements to reflect this.
        // Note: this is an approximation!
        let measurementInSelectedScaleUnits;
        let marsSizeRatio = 0.532612;
        if (action.measurementType === appStrings.MEASURE_AREA) {
            let marsMeasurement = measurement * Math.pow(marsSizeRatio, 2);
            measurementInSelectedScaleUnits = this.mapUtil.convertAreaUnits(
                marsMeasurement,
                action.units
            );
        } else if (action.measurementType === appStrings.MEASURE_DISTANCE) {
            let marsMeasurement = measurement * marsSizeRatio;
            measurementInSelectedScaleUnits = this.mapUtil.convertDistanceUnits(
                marsMeasurement,
                action.units
            );
        } else {
            // If unrecognized measurement type, create an alert and do not continue
            alerts = alerts.push(
                alert.merge({
                    title: appStrings.ALERTS.GEOMETRY_SYNC_FAILED.title,
                    body: appStrings.ALERTS.GEOMETRY_SYNC_FAILED.formatString.replace(
                        "{MAP}",
                        "2D & 3D"
                    ),
                    severity: appStrings.ALERTS.GEOMETRY_SYNC_FAILED.severity,
                    time: new Date()
                })
            );
            return state.set("alerts", alerts);
        }

        // format measurement label
        let measurementLabel = this.mapUtil.formatMeasurement(
            measurementInSelectedScaleUnits,
            action.measurementType,
            action.units
        );

        // determine measurement label position from geometry
        let measurementPosition = this.mapUtil.getLabelPosition(action.geometry);
        let labelMeta = {
            meters: measurement,
            measurementType: action.measurementType,
            interactionType: appStrings.INTERACTION_MEASURE
        };

        // add label to all maps since it's not done automatically for anyone
        state.get("maps").forEach(map => {
            if (!map.addLabel(measurementLabel, measurementPosition, labelMeta)) {
                let contextStr = map.is3D ? "3D" : "2D";
                alerts = alerts.push(
                    alert.merge({
                        title: appStrings.ALERTS.GEOMETRY_SYNC_FAILED.title,
                        body: appStrings.ALERTS.GEOMETRY_SYNC_FAILED.formatString.replace(
                            "{MAP}",
                            contextStr
                        ),
                        severity: appStrings.ALERTS.GEOMETRY_SYNC_FAILED.severity,
                        time: new Date()
                    })
                );
            }
        });

        return state.set("alerts", alerts);
    }

    static zoomToLayer(state, action) {
        // resolve layer from id if necessary
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
            if (typeof actionLayer === "undefined") {
                let alerts = state.get("alerts");
                alerts = alerts.push(
                    alert.merge({
                        title: appStringsDemo.ALERTS.ZOOM_TO_LAYER_FAIILED.title,
                        body: appStringsDemo.ALERTS.ZOOM_TO_LAYER_FAIILED.formatString.replace(
                            "{LAYER}",
                            actionLayer
                        ),
                        severity: appStringsDemo.ALERTS.ZOOM_TO_LAYER_FAIILED.severity,
                        time: new Date()
                    })
                );
                return state.set("alerts", alerts);
            }
        }

        state.get("maps").map(map => {
            map.zoomToLayer(actionLayer);
        });

        return state;
    }
}
