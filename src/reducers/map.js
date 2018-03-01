/**
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypesDemo from "constants/actionTypes";
import { mapState } from "reducers/models/map";
import mapCore from "_core/reducers/map";
import MapReducer from "reducers/reducerFunctions/MapReducer";

export default function map(state = mapState, action, opt_reducer = MapReducer) {
    switch (action.type) {
        case actionTypesDemo.ZOOM_TO_LAYER:
            return opt_reducer.zoomToLayer(state, action);
        default:
            return mapCore.call(this, state, action, opt_reducer);
    }
}
