import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import Typography from "material-ui/Typography";
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
                    <Typography variant="body1" className={styles.sublabel}>
                        {timeStr}
                    </Typography>
                </div>
                <Typography variant="body1" className={styles.sublabel}>
                    {dataProps.get("intensity")} knots · {dataProps.get("minSeaLevelPres")} mb
                </Typography>
            </div>
        );
    }
}

DataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default connect()(DataDisplay);
