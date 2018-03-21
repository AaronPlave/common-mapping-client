# Adding Zoom-To-Layer Functionality

Now let's take a look at adding a more complicated feature. Let's add a "zoom-to-layer" feature that will zoom the map to encompass the extent of a particular layer. To do this we'll need to add a new button to each layer control to expose this feature, tie this button to a new action we'll create, operate on each map in our `Map` reducer, and implement the actual map functionality in the Openlayers and Cesium `MapWrappers`.

## Extending Layer Controls

Let's start by adding an icon button to our layer control component so that we have a way of using the zoom-to functionality we'll be implementing. Since the layer controls component is actually rendered inside of the layer menu component we'll have to work with the layer menu as well. 

First we'll copy over the contents of `_core/components/LayerMenu/LayerMenuContainer.js` into `components/LayerMenu/LayerMenuContainer.js`. We don't really need to extend the core component here since the only method it implements is `render` and that's the only function we'll need to tweak (sort of). Now we'll change the import of `LayerControlContainer` to use a new one we'll make, so go ahead and change:
```JS
import { LayerControlContainer } from "_core/components/LayerMenu";
```
to
```JS
import { LayerControlContainer } from "components/LayerMenu";
```

Now we'll work on extending the layer control component. Go ahead and copy over the contents of `_core/components/LayerMenu/LayerControlContainer.js` into `components/LayerMenu/LayerControlContainer.js`. This time however we do want to extend the Core component instead of the base React component so we'll want to import that component directly:

```JS
import { LayerControlContainer as LayerControlContainerCore } from "_core/components/LayerMenu/LayerControlContainer.js";
```

and change the class definition from:
```JS
export class LayerControlContainer extends Component {
```
to
```JS
export class LayerControlContainer extends LayerControlContainerCore {
```




## Creating a zoom-to action

## Handling the zoom-to action with reducers

## Adding zoom-to functionality to Openlayers

## Adding zoom-to functionality to Cesium
