# Adding Fly-To-Layer Functionality

Now let's take a look at adding a more complicated feature – "fly to layer" functionality. To do this we'll need to add a new button to each layer control to expose this feature, tie this button to a new action we'll create, operate on each map in our `Map` reducer, and implement the actual map functionality in the Openlayers and Cesium `MapWrappers`.

- add functions to map wrappers
- adding in your own layermenucontainer, layercontrolscontainer with new zoom button (explain icon, how to reference it from material-ui-icons/mdi-icons)
- add app action, action types
- add reducer bits and functions
