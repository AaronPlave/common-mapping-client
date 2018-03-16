# Modifying the Hover Interaction

CMC by default implements a map hover workflow for Openlayers. This begins in `src/_core/Components/Map/MapContainer2D.js` where we use the MapWrapper class to attach a mouse move listener and callback. That callback sends the hover information through the Redux reducers and back out the components. This is how the cursor position indicator receives it's state information. For our purposes then, we will start by overriding the `MapReducer` that handles the hover event and add extra fields to the state model.

## Boilerplate

Create and edit `src/reducers/ReducerFunctions/MapReducer.js`

```JS
import Immutable from "immutable";
import moment from "moment";
import * as appStrings from "constants/appStrings";
import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";

export default class MapReducer extends MapReducerCore {}
```