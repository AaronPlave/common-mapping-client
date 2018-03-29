# Overriding Core Vector Layer Styling

- by default core doesn't extract styles on any kml vector layers so we'll need to override a few things to add our  own styles

## Extending MapWrapper 2D and 3D
- extend
- change mapCreator to use new maps

## Overriding MapWrapper functions

- override createVectorLayer
- override createVectorKMLSource