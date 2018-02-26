/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ListItem, ListItemSecondaryAction, ListItemText } from "material-ui/List";
import Divider from "material-ui/Divider";
import InfoOutlineIcon from "material-ui-icons/InfoOutline";
import Typography from "material-ui/Typography";
import Tooltip from "material-ui/Tooltip";
import Collapse from "material-ui/transitions/Collapse";
import Popover from "material-ui/Popover";
import Grow from "material-ui/transitions/Grow";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import { Manager, Target, Popper } from "react-popper";
import { EnhancedSwitch, IconButtonSmall } from "_core/components/Reusables";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsDemo from "actions/mapActions";
import {
    LayerPositionIcon,
    LayerPositionControl,
    LayerOpacityIcon,
    LayerOpacityControl
} from "_core/components/LayerMenu";
import { LayerControlContainer as LayerControlContainerCore } from "_core/components/LayerMenu/LayerControlContainer.js";
import TargetIcon from "material-ui-icons/FilterCenterFocus";
import { Colorbar } from "_core/components/Colorbar";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/LayerMenu/LayerControlContainer.scss";
import textStyles from "_core/styles/text.scss";
import displayStyles from "_core/styles/display.scss";

export class LayerControlContainer extends LayerControlContainerCore {
    zoomToLayer() {
        this.props.mapActionsDemo.zoomToLayer(this.props.layer.get("id"));
    }

    renderIconRow() {
        return (
            <span className={styles.layerControlIconRow}>
                <Manager style={{ display: "inline-block" }}>
                    <Target style={{ display: "inline-block" }}>
                        <Tooltip title={"Set Layer Position"} placement="top">
                            <LayerPositionIcon
                                displayIndex={this.props.layer.get("displayIndex")}
                                activeNum={this.props.activeNum}
                                className={styles.iconButtonSmall}
                                color={this.isChangingPosition ? "primary" : "default"}
                                onClick={() => this.toggleChangingPosition()}
                            />
                        </Tooltip>
                    </Target>
                    <Popper
                        placement="left"
                        modifiers={{
                            computeStyle: {
                                gpuAcceleration: false
                            }
                        }}
                        eventsEnabled={this.isChangingPosition}
                        className={!this.isChangingPosition ? displayStyles.noPointer : ""}
                    >
                        <Grow style={{ transformOrigin: "right" }} in={this.isChangingPosition}>
                            <div>
                                <ClickAwayListener
                                    onClickAway={() => {
                                        if (this.isChangingPosition) {
                                            this.toggleChangingPosition();
                                        }
                                    }}
                                >
                                    <LayerPositionControl
                                        isActive={this.isChangingPosition}
                                        moveToTop={() => this.moveToTop()}
                                        moveToBottom={() => this.moveToBottom()}
                                        moveUp={() => this.moveUp()}
                                        moveDown={() => this.moveDown()}
                                    />
                                </ClickAwayListener>
                            </div>
                        </Grow>
                    </Popper>
                    <Target style={{ display: "inline-block" }}>
                        <Tooltip title={"Set Layer Opacity"} placement="top">
                            <LayerOpacityIcon
                                opacity={this.props.layer.get("opacity")}
                                className={styles.iconButtonSmall}
                                color={this.isChangingOpacity ? "primary" : "default"}
                                onClick={() => this.toggleChangingOpacity()}
                            />
                        </Tooltip>
                    </Target>
                    <Popper
                        placement="left"
                        modifiers={{
                            computeStyle: {
                                gpuAcceleration: false
                            }
                        }}
                        className={!this.isChangingOpacity ? displayStyles.noPointer : ""}
                        eventsEnabled={this.isChangingOpacity}
                    >
                        <Grow style={{ transformOrigin: "right" }} in={this.isChangingOpacity}>
                            <div>
                                <ClickAwayListener
                                    onClickAway={() => {
                                        if (this.isChangingOpacity) {
                                            this.toggleChangingOpacity();
                                        }
                                    }}
                                >
                                    <LayerOpacityControl
                                        isActive={this.isChangingOpacity}
                                        opacity={this.props.layer.get("opacity")}
                                        onChange={value => this.changeOpacity(value)}
                                    />
                                </ClickAwayListener>
                            </div>
                        </Grow>
                    </Popper>
                </Manager>
                <Tooltip title="Zoom to Layer" placement="top">
                    <IconButtonSmall
                        className={styles.iconButtonSmall}
                        onClick={() => this.zoomToLayer()}
                    >
                        <TargetIcon />
                    </IconButtonSmall>
                </Tooltip>
                <Tooltip title="Layer information" placement="top">
                    <IconButtonSmall
                        className={styles.iconButtonSmall}
                        onClick={() => this.openLayerInfo()}
                    >
                        <InfoOutlineIcon />
                    </IconButtonSmall>
                </Tooltip>
            </span>
        );
    }
}

LayerControlContainer.propTypes = {
    mapActions: PropTypes.object.isRequired,
    mapActionsDemo: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    activeNum: PropTypes.number.isRequired,
    palette: PropTypes.object,
    className: PropTypes.string
};

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsDemo: bindActionCreators(mapActionsDemo, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(LayerControlContainer);
