# Overriding Core Vector Layer Styling

- by default core doesn't extract styles on any kml vector layers so we'll need to override a few things to add our  own styles

## Extending MapWrapper 2D and 3D
- extend
- change mapCreator to use new maps

## Overriding MapWrapper functions

- override createVectorLayer
- override createVectorKMLSource

## Decluttering labels

- Rough approach is to declutter labels based on feature size. Could do much better than this but this is just to give you an idea of where to get started. 