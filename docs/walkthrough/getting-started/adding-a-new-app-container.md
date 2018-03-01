# Adding a New App Container

The first step that almost all CMC-based applications will need to take is to substitute the Core version of the `AppContainer` component with a clone of the component that we will modify. `AppContainer` serves as the primary container for all components of the application and you will be using a mixture of Core and custom components as is necessary for your application.

## Copying over Core AppContainer

First, we copy over the contents of `src/_core/components/App` into `src/components/App`, replacing the existing `src/components/App/AppContainer` file. 


Next, in our newly created `index.js` file under `src/components/App/` we will modify the component export to reflect the path of our custom `AppContainer` component.

```JS
export { default as AppContainer } from "components/App/AppContainer.js";
```

_Note that our webpack setup is configured to search for imports under the `src` and `assets` directory which is why the import paths in this walkthrough will not include `src` or `assets` prefixes._
```JS
resolve: {
        modules: [path.join(BASE_DIR, "src"), path.join(BASE_DIR, "assets"), "node_modules"], // Tell webpack to look for imports using these prefixes
        ...
},
```

## Modifying the index.js application entry point

Next we will modify the application entrypoint file `index.js` found at `src/index.js` to use our new `AppContainer`. This entrypoint is defined in our webpack configuration.
```JS
import { AppContainer } from "components/App";
```

Now save your work and refresh your application [localhost:3000](http://localhost:3000). The application should look identical to what we started with, but that's because we haven't made any modifications to our cloned `AppContainer` yet.
