/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Typography from "material-ui/Typography";
import MiscUtil from "_core/utils/MiscUtil";
import { MouseCoordinates as MouseCoordinatesCore } from "_core/components/MouseFollower/MouseCoordinates.js";
import styles from "_core/components/MouseFollower/MouseCoordinates.scss";

export class MouseCoordinates extends MouseCoordinatesCore {}

MouseCoordinates.propTypes = {
    pixelCoordinate: PropTypes.object.isRequired,
    className: PropTypes.string
};

export default connect()(MouseCoordinates);
