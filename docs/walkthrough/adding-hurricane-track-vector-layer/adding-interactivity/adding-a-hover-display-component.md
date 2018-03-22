# Adding a Hover Display Component

Now we will create an extended version of the CMC Core `MouseFollowerContainer` that will include a data display component for hovering over the storm track. Because CMC uses redux to hook components to a shared state machine, technically we usually create [Higher-Order Components](https://reactjs.org/docs/higher-order-components.html) but we will refer to them as regular components nonetheless.

## Boilerplate

Duplicate `src/_core/components/MouseFollower/MouseFollowerContainer.js` to  `src/components/MouseFollower/MouseFollowerContainer.js`

```js
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MiscUtil from "_core/utils/MiscUtil";
import { DrawingTooltip, MouseCoordinates } from "_core/components/MouseFollower";
import textStyles from "_core/styles/text.scss";
import styles from "_core/components/MouseFollower/MouseFollowerContainer.scss";

export class MouseFollowerContainer extends Component {
    shouldComponentUpdate(nextProps) {
        let nextDraworMeasure =
            nextProps.drawing.get("isDrawingEnabled") ||
            nextProps.measuring.get("isMeasuringEnabled");
        let currDrawOrMeasure =
            this.props.drawing.get("isDrawingEnabled") ||
            this.props.measuring.get("isMeasuringEnabled");
        return nextDraworMeasure || nextDraworMeasure !== currDrawOrMeasure;
    }

    render() {
        let maxLeft = window.innerWidth - 300;
        let maxTop = window.innerHeight;

        let top = parseInt(this.props.pixelCoordinate.get("y"));
        let left = parseInt(this.props.pixelCoordinate.get("x"));

        let style = { top, left };

        let drawOrMeasure =
            this.props.drawing.get("isDrawingEnabled") ||
            this.props.measuring.get("isMeasuringEnabled");

        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.mouseFollowerContainer]: true,
            [styles.active]: drawOrMeasure,
            [styles.right]: left > maxLeft,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        // TODO - make a data display component
        return (
            <div className={containerClasses} style={style}>
                <div className={styles.content}>
                    <DrawingTooltip drawing={this.props.drawing} measuring={this.props.measuring} />
                </div>
                <div className={styles.footer}>
                    <MouseCoordinates className={textStyles.fontRobotoMono} />
                </div>
            </div>
        );
    }
}

MouseFollowerContainer.propTypes = {
    pixelCoordinate: PropTypes.object.isRequired,
    drawing: PropTypes.object.isRequired,
    measuring: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        pixelCoordinate: state.map.getIn(["view", "pixelHoverCoordinate"]),
        drawing: state.map.get("drawing"),
        measuring: state.map.get("measuring")
    };
}

export default connect(mapStateToProps, null)(MouseFollowerContainer);
```

Note that in this case, we are creating a new component for the `MouseFollowerContainer` instead of trying to inherit from the CMC Core `MouseFollowerContainer`. This is because the changes we will need to make are extensive enough that using inheritance buys us little and not doing so preserves more traceability. Also note that the default export of this component is comes from the redux `connect` method (which is that is what creates an HOC). This is necessary because we want to connect this component to the shared state machine. If we did not need to read anything directly from state, we could simply export the Component class (as you will see below).

Now create an index file for imports. Create and edit `src/components/MouseFollower/index.js`

```js
export { default as MouseFollowerContainer } from "components/MouseFollower/MouseFollowerContainer.js";
```

Now to use the new component in the app, edit `src/components/App/AppContainer.js` to import the new `MouseFollowerContainer`

From:
```js
...
import { MouseFollowerContainer } from "_core/components/MouseFollower";
...
```
To:
```js
...
import { MouseFollowerContainer } from "components/MouseFollower";
...
```

## Creating a New Component

Recall that when pulling data from the map in a hover event, we stored the returned data in an array. So we'll begin by creating a container component that receives an array of data entries and renders a display for each one.

Create and edit `src/components/MouseFollower/DataDisplayContainer.js`

```js
import React, { Component } from "react";
import PropTypes from "prop-types";
import MiscUtil from "_core/utils/MiscUtil";
import { DataDisplay } from "components/MouseFollower";

export class DataDisplayContainer extends Component {
    render() {
        let classes = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });
        return (
            <div className={classes}>
                {this.props.data.map((entry, i) => (
                    <DataDisplay key={"mouse-follow-data-" + i} data={entry} />
                ))}
            </div>
        );
    }
}

DataDisplayContainer.propTypes = {
    data: PropTypes.object.isRequired,
    className: PropTypes.string
};

export default DataDisplayContainer;
```
You may recall that we explicitly returned an array with a single data entry in our hover interaction (or an empty array if there was no data found). That, combined with our use of `map` to render each entry, means that we don't have to do any checking for undefined entries of lists of length 0 to skip rendering as that will be done implicitly.

Now let's create the `DataDisplay` component to actually render this data entry

Create and edit `src/components/MouseFollower/DataDisplay.js`

```js
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import Typography from "material-ui/Typography";
import Immutable from "immutable";
import { LonLatCoordinates } from "_core/components/Reusables";
import MapUtil from "utils/MapUtil";
import * as appStrings from "constants/appStrings";
import styles from "components/MouseFollower/DataDisplay.scss";

export class DataDisplay extends Component {
    render() {
        let dataProps = this.props.data.get("properties");
        let timeStr = moment(
            dataProps.get("dtg"),
            this.props.data.getIn(["layer", "timeFormat"])
        ).format("MMM DD, HH:mm UTC");
        let category = MapUtil.getStormCategory(dataProps.get("intensity"));
        let coords = this.props.data.get("coords");
        return (
            <div className={styles.root}>
                <div
                    className={styles.titleContainer}
                    style={{ background: category.color, color: category.textColor }}
                >
                    <Typography variant="body2" color="inherit" className={styles.title}>
                        {this.props.data.getIn(["layer", "title"])}
                    </Typography>
                    <Typography variant="body1" color="inherit" className={styles.subtitle}>
                        {category.label}
                    </Typography>
                </div>
                <div className={styles.middleContent}>
                    <Typography className={styles.dateLabel}>{timeStr}</Typography>
                    <LonLatCoordinates
                        className={styles.mouseCoordinatesRoot}
                        lat={coords.get(0)}
                        lon={coords.get(1)}
                    />
                </div>
                <div className={styles.bottomContent}>
                    <div className={styles.valueContainer}>
                        <Typography variant="body1" className={styles.valueLabel}>
                            Wind Speed
                        </Typography>
                        <Typography variant="title" className={styles.valueText}>
                            {dataProps.get("intensity")} knots
                        </Typography>
                    </div>
                    <div className={styles.valueContainer}>
                        <Typography variant="body1" className={styles.valueLabel}>
                            Min Sea Level Pressure
                        </Typography>
                        <Typography variant="title" className={styles.valueText}>
                            {dataProps.get("minSeaLevelPres")} mb
                        </Typography>
                    </div>
                </div>
            </div>
        );
    }
}

DataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default DataDisplay;
```

Now to style it, create and edit `src/components/MouseFollower/DataDisplay.scss`

```css
@import "~styles/colors";

.root {
    padding: 0;
    margin: 0;
}

.color {
    display: inline-block;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    margin-right: 0.5rem;
}
.titleContainer {
    padding: 8px 12px;
}

.title {
    font-size: 1.8rem;
    font-weight: 600;
}

.subtitle {
    text-transform: uppercase;
    font-size: 13px;
    font-weight: 500;
}

.contrastTextColor {
    color: white;
}
.middleContent,
.bottomContent {
    padding: 8px 12px;
}
.middleContent {
    border-bottom: 1px solid $color-medium-light;
    background: #f5f5f5;
}
.dateLabel,
.mouseCoordinatesRoot {
    font-weight: 500;
}
.dateLabel {
    display: inline-block;
}
.mouseCoordinatesRoot {
    margin-left: 20px;
    display: inline-block;
}
.valueLabel {
    font-size: 1.1rem;
    text-transform: uppercase;
    font-weight: 500;
}
.valueContainer {
    display: inline-block;
    margin-right: 40px;
}
```
Notice at the top that we are importing the color SASS variables.


## Using the New Component

Add state to `MouseFollowerContainer`

Update methods and render

Save and refresh and be amazed