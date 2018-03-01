import Immutable from "immutable";
import { mapState as mapStateCore } from "_core/reducers/models/map";

export const mapState = mapStateCore.mergeDeep(
    Immutable.fromJS({
        view: {
            pixelHoverCoordinate: {
                data: [],
                showData: true
            },
            pixelClickCoordinate: {
                data: []
            }
        }
    })
);
