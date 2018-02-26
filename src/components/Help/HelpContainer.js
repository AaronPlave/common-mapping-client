/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import showdown from "showdown";
import Paper from "material-ui/Paper";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import Divider from "material-ui/Divider";
import ListSubheader from "material-ui/List/ListSubheader";
import DescriptionIcon from "material-ui-icons/Description";
import LinkIcon from "material-ui-icons/Link";
import OpenInNewIcon from "material-ui-icons/OpenInNew";
import Typography from "material-ui/Typography";
import * as appActions from "_core/actions/appActions";
import appConfig from "constants/appConfig";
import { ModalMenu } from "_core/components/ModalMenu";
import { MarkdownPage } from "_core/components/Reusables";
import { HelpContainer as HelpContainerCore } from "_core/components/Help/HelpContainer.js";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/Help/HelpContainer.scss";
import displayStyles from "_core/styles/display.scss";

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
