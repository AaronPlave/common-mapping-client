# Customizing the Help Modal Component

Let's extend the Core Help component to suit our needs. The Help component is responsible for displaying a modal menu with several subpages populated by content from markdown files. What we'll do now is extend this component and override the constructor so that we can load our own markdown files.

## Adding New Markdown Files

If we take a look at the constructor of the Core Help component we'll see that it's requiring markdown files from `default-data/_core_default-data/help/`. Since we made a copy of the `default-data` directory earlier in this walkthrough let's go ahead and start modifying our versions of those files. In `default-data/demo-default-data/help/about.md` let's add something like:

```
### Common Mapping Client Walkthrough

This application is a demonstration of the Common Mapping Client.
```

## Extending Core Help component
Now let's copy over the contents of `src/_core/components/Help` into `src/components/Help`. 

To extend the Core Help component we need to import it and change the class definition of our component to extend the Core Help component instead of the base React component. Note that we need to import the component directly from the component file instead of from the root of the directory in order to import just the component class and not the redux `connect` with it.

Additionally, let's change the paths in the constructor to point to our markdown help files. We can also remove the render function since we don't need to modify the Core render version.

```JSX
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import showdown from "showdown";
import * as appActions from "_core/actions/appActions";
import { HelpContainer as HelpContainerCore } from "_core/components/Help/HelpContainer.js";

export class HelpContainer extends HelpContainerCore {
    constructor(props) {
        super(props);

        // set up our markdown converter
        let cvt = new showdown.Converter();
        cvt.setFlavor("github");

        // set up our pages config
        this.helpPageConfig = {
            ABOUT: {
                key: "ABOUT",
                label: "About",
                content: cvt.makeHtml(require("default-data/demo-default-data/help/about.md"))
            },
            FAQ: {
                key: "FAQ",
                label: "FAQ",
                content: cvt.makeHtml(require("default-data/demo-default-data/help/faq.md"))
            },
            SYS_REQ: {
                key: "SYS_REQ",
                label: "System Requirements",
                content: cvt.makeHtml(require("default-data/demo-default-data/help/systemReqs.md"))
            }
        };
    }
}

HelpContainer.propTypes = {
    appActions: PropTypes.object.isRequired,
    helpOpen: PropTypes.bool.isRequired,
    helpPage: PropTypes.string.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        helpOpen: state.help.get("isOpen"),
        helpPage: state.help.get("helpPage")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HelpContainer);
```

## Changing the import in App Container

Finally, we need to import our new help component into our App container:
`import { HelpContainer } from "components/Help";`

and remove the import of the Core Help component:
~~import { HelpContainer } from "_core/components/Help";~~

If you save your work and reload the page you should now see  our new about page content displaying in the about subpage of the Help component.