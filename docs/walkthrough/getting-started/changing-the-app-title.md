# Changing the App Title

Let's continue with some other basic customizations by changing the title of this application.

## Changing the app title in app config

First we'll override the default application title of _"Common Mapping Client"_ and set it to _"CMC Walkthrough – Mars"_. To do so, we'll need to make use of the `appConfig.js` file located under `src/constants/`. By adding to the `APP_CONFIG` object we can override values found in the Core `appConfig.js` file located under `src/_core/constants/`. In our case we'll override `APP_TITLE`.
```JS
const APP_CONFIG = Immutable.fromJS({
    APP_TITLE: "CMC Walkthrough – Mars"
});
```

## Changing the app title in index_template.html
One other place we need to change the app title is in our splash screen since this isn't hooked up to use our appConfig.
```HTML
<title>CMC Walkthrough – Mars</title>
...
<div class="loadingAppTitle">CMC Walkthrough – Mars</div>
```

Now back in the browser reload the application and you should see the splash screen title and the app title in the top right corner reflect the newly configured title.