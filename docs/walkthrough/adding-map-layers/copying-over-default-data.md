# Copying Over Default Data

CMC by default serves many configurations out of a static folder called `_core-default-data` located in `src/default-data/`. These configurations are used to populate CMC with layers, provide metadata for these layers, and populate help content. Much of this configuration data could be served from a database but for small applications with limited numbers of layers a static directory should be adequate.

To begin customizing these configurations we'll want to duplicate the Core `_core-default-data` as something like `demo-default-data` alongside the original folder.