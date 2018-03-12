# Reusable Utility Functions

Before updating the MapWrappers, let's decide what exactly we want them to show. Our goal is to render each point in the storm track with some visual cue to indicate the storm's status at that point. If we inspect `src/default-data/demo-default-data/al152017_best_track_Maria.kml` we can see that each `Placemark` has `<ExtendedData>` which includes an `intensity` measurement in knots. Consulting [Wikipedia](https://en.wikipedia.org/wiki/Saffir–Simpson_scale) we can see that wind speed is used to categorize a storm from a Tropical Depression all the way to a Category 5 Hurricane. So, using `intensity` as our target, we can provide, at a glance, the classification the storm at each point.

Now, let's create some functions to let us to that. First we'll store the categories and colors we want to use in `src/constants/appStrings.js`

```js
...
export const STORM_CATEGORIES = {
    tropical_depression: { color: "#1976d2", textColor: "black", label: "Tropical Depression" },
    tropical_storm: { color: "#26c6da", textColor: "white", label: "Tropical Storm" },
    cat_1: { color: "#ffee58", textColor: "black", label: "Category 1 Hurricane" },
    cat_2: { color: "#ffca28", textColor: "black", label: "Category 2 Hurricane" },
    cat_3: { color: "#ffb300", textColor: "black", label: "Category 3 Hurricane" },
    cat_4: { color: "#fb8c00", textColor: "white", label: "Category 4 Hurricane" },
    cat_5: { color: "#e53935", textColor: "white", label: "Category 5 Hurricane" }
};
...
```
This is just a mapping of storm categories to a representative color, label, and contrasting text color for display.

Next, we'll create a function to search within this set of categories. Create and edit `src/utils/MapUtil.js`

```js
import MapUtilCore from "_core/utils/MapUtil";
import * as appStrings from "constants/appStrings";

export default class MapUtil extends MapUtilCore {
    static getStormCategory(intensity) {
        if (intensity <= 33) {
            return appStrings.STORM_CATEGORIES.tropical_depression;
        } else if (intensity > 33 && intensity <= 63) {
            return appStrings.STORM_CATEGORIES.tropical_storm;
        } else if (intensity > 63 && intensity <= 82) {
            return appStrings.STORM_CATEGORIES.cat_1;
        } else if (intensity > 82 && intensity <= 95) {
            return appStrings.STORM_CATEGORIES.cat_2;
        } else if (intensity > 95 && intensity <= 112) {
            return appStrings.STORM_CATEGORIES.cat_3;
        } else if (intensity > 112 && intensity <= 136) {
            return appStrings.STORM_CATEGORIES.cat_4;
        } else if (intensity > 136) {
            return appStrings.STORM_CATEGORIES.cat_5;
        }

        return { color: "#ffffff", label: "Category not found", textColor: "black" };
    }
}
```
This new MapUtil class extends the CMC Core MapUtil class and adds a function that takes a wind speed measurement in knots and returns the appropriate color/label entry we stored in `src/constants/appStrings.js` or a `Category not found` entry if there was no match.

Now, in order to use this new class in the MapWrapper instances, we must override each classes static MapUtil class reference.

In `src/utils/MapWrapperOpenlayers.js`, add the following

```js
...
import MapUtil from "utils/MapUtil";
...
export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {
    ...
    initStaticClasses(container, options) {
        MapWrapperOpenlayersCore.prototype.initStaticClasses.call(this, container, options);
        this.mapUtil = MapUtil;
    }
    ...
}
```

In `src/utils/MapWrapperCesium.js`, add the following

```js
...
import MapUtil from "utils/MapUtil";
...
export default class MapWrapperCesium extends MapWrapperCesiumCore {
    ...
    initStaticClasses(container, options) {
        MapWrapperCesiumCore.prototype.initStaticClasses.call(this, container, options);
        this.mapUtil = MapUtil;
    }
    ...
}
```

Now we can use the new value-to-color function in MapUtil and we can extend the MapWrapper classes to render the points accordingly.
