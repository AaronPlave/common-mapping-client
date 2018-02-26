/**
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypesDemo from "constants/actionTypes";
import { mapState } from "_core/reducers/models/map";
import map from "_core/reducers/map";
import MapReducerExtended from "reducers/reducerFunctions/MapReducer";

export default function mapExtended(state = mapState, action, opt_reducer = MapReducerExtended) {
    switch (action.type) {
        case actionTypes.ADD_MEASUREMENT_LABEL_TO_GEOMETRY:
            return opt_reducer.addMeasurementLabelToGeometry(state, action);
        case actionTypesDemo.ZOOM_TO_LAYER:
            return opt_reducer.zoomToLayer(state, action);
        default:
            return map.call(this, state, action, opt_reducer);
    }
}
