# Adding Zoom-To-Layer Functionality

Now let's take a look at adding a more complicated feature. Let's add a "zoom-to-layer" feature that will zoom the map to encompass the extent of a particular layer. To do this we'll need to add a new button to each layer control to expose this feature, tie this button to a new action we'll create, operate on each map in our `Map` reducer, and implement the actual map functionality in the Openlayers and Cesium `MapWrappers`.

## Creating a zoom-to action

In Redux, an action is a function that emits an object that contains information on what to update in state. So let's begin by defining a string that will distinguish this new action object from all the others.

Create and edit `src/constants/actionTypes.js`

```js
export const ZOOM_TO_LAYER = "ZOOM_TO_LAYER";
```

Now we'll create the action function that will take a reference to a layer and emit an action object describing the action of zooming to that layer.

Create and edit `src/actions/mapActions.js`

```js
import * as types from "constants/actionTypes";

export function zoomToLayer(layer) {
    return { type: types.ZOOM_TO_LAYER, layer };
}
```

Now that we have an action object that contains all the information we need to execute the action, let's add a handler for that action in our reducers.

## Handling the zoom-to action with reducers

Reducers receive the current state of the application and an action and return a new state based on the change described by that action. In CMC, we use the reducer `switch` statements in the reducers to filter through actions and perform the actual state changes in our `*Reducer.js` classes.

When overriding the mouse interactions for the hurricane track, we already created the files we will be modifying. So make sure you have gone through that section prior to this.

Edit `src/reducers/map.js` and add the following case to the switch statement

```js
case actionTypes.ZOOM_TO_LAYER:
    return opt_reducer.zoomToLayer(state, action);
```

## Adding zoom-to functionality to Openlayers

## Adding zoom-to functionality to Cesium

## Extending Layer Controls

Let's start by adding an icon button to our layer control component so that we have a way of using the zoom-to functionality we'll be implementing. Since the layer controls component is actually rendered inside of the layer menu component we'll have to work with the layer menu as well.

First we'll copy over the contents of `_core/components/LayerMenu/LayerMenuContainer.js` into `components/LayerMenu/LayerMenuContainer.js`. We don't really need to extend the core component here since the only method it implements is `render` and that's the only function we'll need to tweak \(sort of\). Now we'll change the import of `LayerControlContainer` to use a new one we'll make, so go ahead and change:

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

Now we'll override the function that renders the row of icons inside the layer control in order to add a zoom-to button. We'll want to copy the original `renderIconRow` function and add our button. We'll also need to import an icon to use for this icon button.

```JSX
...
import TargetIcon from "material-ui-icons/FilterCenterFocus";
...
export class LayerControlContainer extends LayerControlContainerCore {
...
    zoomToLayer() {}

    renderIconRow() {
        let positionPopoverClasses = MiscUtil.generateStringFromSet({
            [styles.popover]: true,
            [styles.positionPopover]: true,
            [displayStyles.noPointer]: !this.isChangingPosition
        });

        let opacityPopoverClasses = MiscUtil.generateStringFromSet({
            [styles.popover]: true,
            [displayStyles.noPointer]: !this.isChangingOpacity
        });

        return (
            <span className={styles.layerControlIconRow}>
                <Manager style={{ display: "inline-block" }}>
                    <ClickAwayListener
                        onClickAway={() => {
                            if (this.isChangingPosition) {
                                this.toggleChangingPosition();
                            }
                        }}
                    >
                        <Target style={{ display: "inline-block" }}>
                            <Tooltip title={"Set Layer Position"} placement="top">
                                <LayerPositionIcon
                                    displayIndex={this.props.layer.get("displayIndex")}
                                    activeNum={this.props.activeNum}
                                    className={styles.iconButtonSmall}
                                    color={this.isChangingPosition ? "primary" : "default"}
                                    onClick={() => this.toggleChangingPosition()}
                                />
                            </Tooltip>
                        </Target>
                        <Popper
                            placement="left-end"
                            modifiers={{
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }}
                            eventsEnabled={this.isChangingPosition}
                            className={positionPopoverClasses}
                        >
                            <Grow style={{ transformOrigin: "right" }} in={this.isChangingPosition}>
                                <div>
                                    <LayerPositionControl
                                        isActive={this.isChangingPosition}
                                        moveToTop={() => this.moveToTop()}
                                        moveToBottom={() => this.moveToBottom()}
                                        moveUp={() => this.moveUp()}
                                        moveDown={() => this.moveDown()}
                                    />
                                </div>
                            </Grow>
                        </Popper>
                    </ClickAwayListener>
                    <ClickAwayListener
                        onClickAway={() => {
                            if (this.isChangingOpacity) {
                                this.toggleChangingOpacity();
                            }
                        }}
                    >
                        <Target style={{ display: "inline-block" }}>
                            <Tooltip title={"Set Layer Opacity"} placement="top">
                                <LayerOpacityIcon
                                    opacity={this.props.layer.get("opacity")}
                                    className={styles.iconButtonSmall}
                                    color={this.isChangingOpacity ? "primary" : "default"}
                                    onClick={() => this.toggleChangingOpacity()}
                                />
                            </Tooltip>
                        </Target>
                        <Popper
                            placement="left-end"
                            modifiers={{
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }}
                            className={opacityPopoverClasses}
                            eventsEnabled={this.isChangingOpacity}
                        >
                            <Grow style={{ transformOrigin: "right" }} in={this.isChangingOpacity}>
                                <div>
                                    <LayerOpacityControl
                                        isActive={this.isChangingOpacity}
                                        opacity={this.props.layer.get("opacity")}
                                        onChange={value => this.changeOpacity(value)}
                                    />
                                </div>
                            </Grow>
                        </Popper>
                    </ClickAwayListener>
                </Manager>
                <Tooltip title="Zoom to Layer" placement="top">
                    <IconButtonSmall
                        className={styles.iconButtonSmall}
                        onClick={() => this.zoomToLayer()}
                    >
                        <TargetIcon />
                    </IconButtonSmall>
                </Tooltip>
                <Tooltip title="Layer information" placement="top">
                    <IconButtonSmall
                        className={styles.iconButtonSmall}
                        onClick={() => this.openLayerInfo()}
                    >
                        <InfoOutlineIcon />
                    </IconButtonSmall>
                </Tooltip>
            </span>
        );
    }
}
```



