# Modifying the Mouse Interactions

CMC by default implements a map hover and click workflow for Openlayers and Cesium. This begins in `src/_core/Components/Map/MapContainer2D.js` and `src/_core/Components/Map/MapContainer3D.js` where we use the MapWrapper class to attach a mouse move and click listener to the Openlayers/Cesium map. That callback sends the event information through the Redux reducers and back out to the components. This is how the cursor position indicator receives it's state information. For our purposes then, we will start by extra fields to the state model, and then overriding the `MapReducer` that handles the mouse events.

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

Because we know that we'll be calling this function from a mouse event, we can expect to be passed a screen space location ([x,y] pixel coordinate) from which to pull the related data. That's handy because both Cesium and Openlayers have built-in functions for retrieving vector data at a pixel. We'll begin with Openlayers.

Edit `src/utils/MapWrapperOpenlayers.js` and add the following function

```js
...
getDataAtPoint(pixel) {
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
...
```
This function expects a pixel coordinate, then uses the Openlayers map object (stored as an instance variable in all MapWrapper classes) to iterate over all vector features at that location. For each feature it checks to see if it's a `Point` (which how we rendered this storm data) and then pull out the associated data we care about. After it has built a list of all available point data entries, it returns just the top entry for display.

This same basic process will be mirrored in our Cesium implementation.

Edit `src/utils/MapWrapperCesium.js` and add the following function

```js
...
getDataAtPoint(pixel) {
    try {
        let data = []; // the collection of pixel data to return

        let pickedObjects = this.map.scene.drillPick(
            new this.cesium.Cartesian2(pixel[0], pixel[1]),
            1
        );
        for (let i = 0; i < pickedObjects.length; ++i) {
            let entity = pickedObjects[i];
            if (entity.id && entity.id.kml && entity.id.kml.extendedData) {
                data.push({
                    layerId: entity.id._layerId,
                    properties: {
                        intensity: parseInt(entity.id.kml.extendedData.intensity.value),
                        minSeaLevelPres: parseInt(
                            entity.id.kml.extendedData.minSeaLevelPres.value
                        ),
                        dtg: entity.id.kml.extendedData.dtg.value
                    },
                    coords: [
                        parseFloat(entity.id.kml.extendedData.lon.value),
                        parseFloat(entity.id.kml.extendedData.lat.value)
                    ]
                });
            }
        }

        // pull just one feature to display
        return data.slice(0, 1);

        // return data;
    } catch (err) {
        console.warn("Error in MapWrapperCesium.getDataAtPoint:", err);
        return [];
    }
}
...
```
You can see this function is almost identical to our Openlayers function with the main difference being in the Cesium specific functions we use. This principle is true for most MapWrapper functions.

Now to use these functions to add extracted vector data to state.

## Overriding the Reducer Functions

As we mentioned before, because we have our `map.js` reducer passing our `MapReducer.js` class to it's reducer, in order to change the behavior of any existing reducer function for any action handled by `src/_core/reducers/map.js` we simply have to override the function in our `MapReducer.js` class. In this case, the two functions we will alter are `static pixelHover(state, action)` and `static pixelClick(state, action)`. We will alter these in essentially the same way. We being by doing a direct copy/paste from `src/_core/reducers/reducerFunctions/MapReducer.js`

Edit `src/reducers/reducerFunctions/MapReducers.js`

```js
export default class MapReducer extends MapReducerCore {
    static pixelHover(state, action) {
        let pixelCoordinate = state.getIn(["view", "pixelHoverCoordinate"]).set("isValid", false);
        state.get("maps").forEach(map => {
            if (map.isActive) {
                let coords = map.getLatLonFromPixelCoordinate(action.pixel);
                if (coords) {
                    pixelCoordinate = pixelCoordinate
                        .set("lat", coords.lat)
                        .set("lon", coords.lon)
                        .set("x", action.pixel[0])
                        .set("y", action.pixel[1])
                        .set("isValid", coords.isValid);
                    return false;
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
                    if (coords) {
                        pixelCoordinate = pixelCoordinate
                            .set("lat", coords.lat)
                            .set("lon", coords.lon)
                            .set("x", pixel[0])
                            .set("y", pixel[1])
                            .set("isValid", coords.isValid);
                        return false;
                    }
                }
            }
            return true;
        });
        return state.setIn(["view", "pixelClickCoordinate"], pixelCoordinate);
    }
}
```
As they are, these functions take the current map section of the state of the application along with an action that contains the hover or click event information. They use the MapWrapper instances in state to resolve the associated lat/lon location for the pixel coordinate and stores that information in state and returns the new state.

Recall that we wrote our new MapWrapper functions specifically with the idea that we would resolve vector data from the pixel of the mouse event. So all we need to do is add in a step to pull the vector data (if any) from the map. Let's start with `pixelHover`

Edit `src/reducers/reducerFunctions/MapReducers.js`

```js
...
static pixelHover(state, action) {
    let pixelCoordinate = state.getIn(["view", "pixelHoverCoordinate"]).set("isValid", false);
    state.get("maps").forEach(map => {
        if (map.isActive) {
            let coords = map.getLatLonFromPixelCoordinate(action.pixel);

            let data = [];
            if (coords && coords.isValid) {
                // find data if any
                data = map.getDataAtPoint(action.pixel);
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
...
```
See that now we have added a step to pull the vector data with our `getDataAtPoint` function, and have added the results of that query to the state update. Notice that we are also resolving the full state object of the layer at the given point from the layer id string which is all the MapWrapper instances have to reference. Now we'll apply almost identical changes to `pixelClick`

```js
...
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
                    data = map.getDataAtPoint(action.clickEvt.pixel);
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
...
```
Here we've added a step after the state update to set the map date to the one returned from our query.

Save your work and refresh the browser. Now when you click on a point on the storm track, the date should change to the associated time. However, nothing shows up when you hover over the points. That is because we do not yet have a UI component that knows to read the new pieces of state, much less how to display them. So lets do that next.
