# Changing the Map Projection

Let's make this walkthrough a little more interesting by modifying the map projection. CMC includes a few of the commonly used projections built into it's configurations: LonLat, WebMercator, Polar \(north\), and Polar \(south\). By default, CMC is configured or LonLat, but let's switch that to WebMercator.

Open `src/constants/appConfig.js` and set the following values:

```
...
import * as appStringsCore from "_core/constants/appStrings";

...

const APP_CONFIG = Immutable.fromJS({
    ...
    DEFAULT_PROJECTION: appStringsCore.PROJECTIONS.webmercator,
    DEFAULT_MAP_EXTENT: [-20026376.39 * 1.5, -20048966.1, 20026376.39 * 1.5, 20048966.1],
    MAX_RESOLUTION: undefined
    ...
});

...
```

`DEFAULT_PROJECTION` will set the projection of the 2D map within the application. `DEFAULT_MAP_EXTENT` will set the maximum extent the map will render. Note that it must be in the units of the specified projection and that here we are taking the East/West bounds of the WebMercator projection and multplying by 1.5 so that we will render a map a half instead of a continuously wrapping map. `MAX_RESOLUTION` defines the highest pixel resolution the map will render. By default, CMC uses a `MAX_RESOLUTION` that fits the LonLat projection of [GIBS](https://wiki.earthdata.nasa.gov/display/GIBS/), setting it to `undefined` means it will be dynamically set based on the projection.

Save your changes and reload your browser. You should now see a WebMercator map that displays a half time beyond the dateline in either direction.



