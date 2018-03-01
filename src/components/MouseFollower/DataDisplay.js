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
        ).format("MMM DD · HH:mm UTC");
        let color = MapUtil.getStormColor(dataProps.get("intensity"));

        return (
            <div className={styles.root}>
                <div className={styles.color} style={{ background: color }} />
                <Typography variant="body2" className={styles.label}>
                    {this.props.data.getIn(["layer", "title"])}
                </Typography>
                <Typography variant="caption" className={styles.sublabel}>
                    {timeStr}
                </Typography>
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
