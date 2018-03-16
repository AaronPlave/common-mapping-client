/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import { alert } from "_core/reducers/models/alert";
import * as appStrings from "constants/appStrings";
import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class MapReducer extends MapReducerCore {
    static zoomToLayer(state, action) {
        // resolve layer from id if necessary
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
            if (typeof actionLayer === "undefined") {
                let alerts = state.get("alerts");
                alerts = alerts.push(
                    alert.merge({
                        title: appStrings.ALERTS.ZOOM_TO_LAYER_FAIILED.title,
                        body: appStrings.ALERTS.ZOOM_TO_LAYER_FAIILED.formatString.replace(
                            "{LAYER}",
                            actionLayer
                        ),
                        severity: appStrings.ALERTS.ZOOM_TO_LAYER_FAIILED.severity,
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

    static pixelHover(state, action) {
        let pixelCoordinate = state.getIn(["view", "pixelHoverCoordinate"]).set("isValid", false);
        state.get("maps").forEach(map => {
            if (map.isActive) {
                let coords = map.getLatLonFromPixelCoordinate(action.pixel);

                let data = [];
                if (coords && coords.isValid) {
                    // find data if any
                    data = map.getDataAtPoint(coords, action.pixel);
                    data = data !== false ? data : [];
                    data = Immutable.fromJS(
                        data.map(entry => {
                            entry.layer = this.findLayerById(state, entry.layerId);
                            return entry;
                        })
                    );

                    // set the coordinate as valid and store the data
                    pixelCoordinate = pixelCoordinate
                        .set("lat", coords.lat)
                        .set("lon", coords.lon)
                        .set("x", action.pixel[0])
                        .set("y", action.pixel[1])
                        .set("data", data)
                        .set("showData", data.size > 0)
                        .set("isValid", true);
                    return false;
                } else {
                    pixelCoordinate = pixelCoordinate.set("isValid", false);
                }
            }
            return true;
        });
        return state.setIn(["view", "pixelHoverCoordinate"], pixelCoordinate);
    }

    static pixelClick(state, action) {
        let pixelCoordinate = state.getIn(["view", "pixelClickCoordinate"]).set("isValid", false);
        state.get("maps").forEach(map => {
            if (map.isActive) {
                let pixel = map.getPixelFromClickEvent(action.clickEvt);
                if (pixel) {
                    let coords = map.getLatLonFromPixelCoordinate(pixel);

                    let data = [];
                    if (coords && coords.isValid) {
                        // find data if any
                        data = map.getDataAtPoint(coords, action.clickEvt.pixel);
                        data = data !== false ? data : [];
                        data = Immutable.fromJS(
                            data.map(entry => {
                                entry.layer = this.findLayerById(state, entry.layerId);
                                return entry;
                            })
                        );

                        // set the coordinate as valid and store the data
                        pixelCoordinate = pixelCoordinate
                            .set("lat", coords.lat)
                            .set("lon", coords.lon)
                            .set("x", action.clickEvt.pixel[0])
                            .set("y", action.clickEvt.pixel[1])
                            .set("data", data)
                            .set("isValid", true);

                        // update the date
                        let dateStr = data.getIn([0, "properties", "dtg"]);
                        if (typeof dateStr !== "undefined") {
                            let date = moment(
                                dateStr,
                                data.getIn([0, "layer", "timeFormat"])
                            ).toDate();
                            state = MapReducerCore.setMapDate(state, { date: date });
                        }
                        return false;
                    } else {
                        pixelCoordinate = pixelCoordinate.set("isValid", false);
                    }
                }
            }
            return true;
        });
        return state.setIn(["view", "pixelClickCoordinate"], pixelCoordinate);
    }
}
