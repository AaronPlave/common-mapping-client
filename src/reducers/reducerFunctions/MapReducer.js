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
