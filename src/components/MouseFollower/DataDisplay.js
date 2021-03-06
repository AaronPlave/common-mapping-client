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
