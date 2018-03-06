# Extending the MapWrappers

Now its time to dive into adding new functionality to this application. We have a storm track, but it doesn't display. That's because CMC is attempting to use the built-in styles which use a Placemark image, but we want to dynamically style each Placemark according to the wind speed registered at that point. To do so, we must override functions in the MapWrapper classes to change how they render this type of layer.

## Creating New MapWrappers

Let's start by creating basic MapWrapper objects.

Create : `src/utils/MapWrapperOpenlayers.js`

```
import MapWrapperOpenlayersCore from "_core/utils/MapWrapperOpenlayers";

export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {}
```

Create: `src/utils/MapWrapperCesium.js`

```
import MapWrapperCesiumCore from "_core/utils/MapWrapperCesium";

export default class MapWrapperCesium extends MapWrapperCesiumCore {}
```

Now we have two MapWrapper classes, one for each library we will be using to render maps, that inherit from the CMC Core MapWrapper classes so we can override the built-in functionality. However, the application doesn't know to use them, yet.

## Making Use of the New MapWrappers

Let's look at `src/utils/MapCreator.js` . This file does one thing, it exports a function that is used to instantiate a MapWrapper. This is the function that CMC calls when the application attempts to initialize a map. By default, it will use the CMC Core MapWrappers for Openlayers \(2D\) and Cesium \(3D\). So all we have to do is change the import at the top to:

```
import MapWrapperOpenlayers from "utils/MapWrapperOpenlayers";
import MapWrapperCesium from "utils/MapWrapperCesium";
```

And now when the application initializes the 2D and 3D map, it will instantiate our new MapWrapper classes. Now let's see about modifying their behavior.



