# Changing the App Color Theme

Let's make our first real change to our application. We'll start off with something simple to make sure we have our new `AppContainer` wired up properly. 

## Modifying the Material UI theme

In your new `AppContainer` let's modify the `theme` variable declared near the beginning of the file. This `theme` is part of the theming system of Material-UI (the primary component library CMC ships with). You can read more about Material-UI theming [here](https://material-ui-next.com/customization/themes/#themes). 

Since this walkthrough is focused on Mars, we'll generate a color scheme a bit more Mars themed. To do this we'll use [Google's Material Color Tool](https://material.io/color/). We'll use [this](https://material.io/color/#!/?view.left=0&view.right=0&primary.color=DD2C00) color scheme for now but you can substitute whichever colors you like. 
```JS
const theme = createMuiTheme({
    typography: {
        htmlFontSize: 10
    },
    palette: {
        primary: {
            main: "#dd2c00",
            light: "#ff6434",
            dark: "#a30000",
            contrastText: "#fff"
        }
    }
});
```


## Modifying the CMC Color Variables

We're almost done customizing the main colors of our application but there's one more place we need to make a modification. In `src/styles/_colors.scss` we'll need to modify the `$color-primary` SASS variable to use our new primary main color. CMC uses this `$color-primary` variable in several component style files when creating custom components since hooking in to Material-UI's color theme for custom components can often be a bit cumbersome.

```SASS
$color-secondary: #dd2c00;
```

Now if we look at our application in the browser we may not see an immediate change in the default state but if we open up something like the help menu or turn on a map layer we should see that our primary color is now being used for components like checkboxes, toggles, and headers.


