# Modifying the Mouse Interactions

CMC by default implements a map hover and click workflow for Openlayers and Cesium. This begins in `src/_core/Components/Map/MapContainer2D.js` and `src/_core/Components/Map/MapContainer3D.js` where we use the MapWrapper class to attach a mouse move and click listener to the Openlayers/Cesium map. That callback sends the event information through the Redux reducers and back out the components. This is how the cursor position indicator receives it's state information. For our purposes then, we will start by extra fields to the state model, and then overriding the `MapReducer` that handles the mouse events.

## Boilerplate

Create and edit `src/reducers/models/map.js`

```js
import Immutable from "immutable";
import { mapState as mapStateCore } from "_core/reducers/models/map";

export const mapState = mapStateCore.mergeDeep(
    Immutable.fromJS({})
);
```
This creates a map state model that is essentially a duplicate of the CMC Core map state model. We add fields to it later.

Create and edit `src/reducers/ReducerFunctions/MapReducer.js`

```js
import Immutable from "immutable";
import moment from "moment";
import * as appStrings from "constants/appStrings";
import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";

export default class MapReducer extends MapReducerCore {}
```

This is our starting point for overriding the CMC Core MapReducer functions. Now we need to get this class used

Create and edit `src/reducers/map.js`

```js
import * as actionTypes from "constants/actionTypes";
import { mapState } from "reducers/models/map";
import mapCore from "_core/reducers/map";
import MapReducer from "reducers/reducerFunctions/MapReducer";

export default function map(state = mapState, action, opt_reducer = MapReducer) {
    switch (action.type) {
        default:
            return mapCore.call(this, state, action, opt_reducer);
    }
}
```

This defines the actual reducer function that handles map actions. Notice that for now, all actions are being delegated to the CMC Core reducer function. However, we are passing the CMC Core reducer our new MapReducer class to use for the actual reducer functions. That means that all we have to do to change a MapReducer function is to override it in our new MapReducer class. Notice also that we are using the `mapState` from our new model in `reducers/models/map`. This is how we incorporate our new state fields into the application.

Now, the last bit of boilerplate is to make this new reducer function be used in the application.

Edit `src/reducers/index.js` and change the import location of the map to `reducers/map`

From:

```js
...
import map from "_core/reducers/map";
...
```

to:

```js
...
import map from "reducers/map";
...
```
Now our Redux store reducer will be using our new reducer function which includes our new state model and reducer/MapReducer functions.

## Adding Pieces of State

As mentioned above, CMC Core already tracks hover and click information in state. After looking `src/_core/models/map.js` you may find `mapState.view.pixelHoverCoordinate` and `mapState.view.pixelClickCoordinate`, that will be our target for adding additional pieces of information for these interactions.

Edit `src/reducers/models/map.js` and modify the exported `mapState`

```js
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
```
Notice that we are using the same object key structure as the CMC Core model and ImmutableJS.mergeDeep to blend the two together. This means that we won't be removing or changing any data in the existing model, but only adding our new fields.

## Adding MapWrapper Functions

Now that we have an array in state, we'll want to fill it with something useful. Now we'll add a functions to our MapWrapper classes for retrieving data at a point.




