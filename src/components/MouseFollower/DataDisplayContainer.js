/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

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
