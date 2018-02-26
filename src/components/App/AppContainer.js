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
import { MuiThemeProvider, createMuiTheme } from "material-ui/styles";
import { pink } from "material-ui/colors";
import * as appActions from "_core/actions/appActions";
import * as mapActions from "_core/actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import {
    MapContainer,
    MapContextMenu,
    CoordinateTracker,
    MapControlsContainer
} from "_core/components/Map";
import { ShareContainer } from "_core/components/Share";
import { LayerInfoContainer } from "_core/components/LayerInfo";
import { SettingsContainer } from "_core/components/Settings";
import { LoadingContainer } from "_core/components/Loading";
import { HelpContainer } from "components/Help";
import { AlertsContainer } from "_core/components/Alerts";
import { AppBarContainer } from "_core/components/AppBar";
import { LayerMenuContainer } from "components/LayerMenu";
import { MouseFollowerContainer } from "_core/components/MouseFollower";
import { AnalyticsContainer } from "_core/components/Analytics";
import { KeyboardControlsContainer } from "_core/components/KeyboardControls";
import styles from "_core/components/App/AppContainer.scss";
import stylesExtended from "components/App/AppContainer.scss";
import displayStyles from "_core/styles/display.scss";

const theme = createMuiTheme({
    typography: {
        htmlFontSize: 10
    },
    palette: {
        primary: {
            main: "#dd2c00",
            light: "#ff6434",
            dark: "#a30000",
            contrastText: "#fff"
        }
    }
});

export class AppContainer extends Component {
    constructor(props) {
        super(props);

        // Setting urlParams as a local variable avoids setting application state before
        // we know if we want to set state via urlParams. If you set urlParams in state,
        // you'd need to set app state to default and then check for urlParams and configure,
        // but that would change the urlParams, wiping out desired urlParams.

        // Generally speaking, however, it is not recommended to rely on instance variables inside of
        // components since they lie outside of the application state and Redux paradigm.
        this.urlParams = MiscUtil.getUrlParams();
    }

    componentDidMount() {
        // disable the right click listener
        document.addEventListener(
            "contextmenu",
            function(e) {
                e.preventDefault();
            },
            false
        );

        // Perform initial browser functionality check
        this.props.checkBrowserFunctionalities();

        // load in initial data
        this.props.loadInitialData(() => {
            // initialize the map. I know this is hacky, but there simply doesn't seem to be a good way to
            // wait for the DOM to complete rendering.
            // see: http://stackoverflow.com/a/34999925
            window.requestAnimationFrame(() => {
                setTimeout(() => {
                    // initialize the maps
                    this.props.initializeMap(appStrings.MAP_LIB_2D, "map2D");
                    this.props.initializeMap(appStrings.MAP_LIB_3D, "map3D");

                    // set initial view
                    this.props.setMapView({ extent: appConfig.DEFAULT_BBOX_EXTENT }, true);

                    // activate default/url params
                    if (this.urlParams.length === 0) {
                        this.props.activateDefaultLayers();
                    } else {
                        this.props.runUrlConfig(this.urlParams);
                    }

                    // signal complete
                    this.props.completeInitialLoad();

                    // ReactTooltip needs to be rebuilt to account
                    // for dynamic lists in LayerMenuContainer
                    // ReactTooltip.rebuild();
                }, 0);
            });
        });
    }

    render() {
        let hideMouse = this.props.mapControlsHidden && this.props.distractionFreeMode;
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.appContainer]: true,
            [displayStyles.mouseVisible]: !hideMouse,
            [displayStyles.mouseHidden]: hideMouse
        });
        return (
            <MuiThemeProvider theme={theme}>
                <div className={containerClasses}>
                    <HelpContainer />
                    <MapContainer />
                    <LoadingContainer />
                    <MapControlsContainer className={stylesExtended.mapControlContainer} />
                    <AppBarContainer />
                    <SettingsContainer />
                    <ShareContainer />
                    <LayerInfoContainer />
                    <LayerMenuContainer />
                    <AlertsContainer />
                    <MapContextMenu />
                    <MouseFollowerContainer />
                    <AnalyticsContainer />
                    <KeyboardControlsContainer />
                    <CoordinateTracker className={stylesExtended.coordinateTracker} />
                </div>
            </MuiThemeProvider>
        );
    }
}

AppContainer.propTypes = {
    completeInitialLoad: PropTypes.func.isRequired,
    checkBrowserFunctionalities: PropTypes.func.isRequired,
    loadInitialData: PropTypes.func.isRequired,
    activateDefaultLayers: PropTypes.func.isRequired,
    runUrlConfig: PropTypes.func.isRequired,
    initializeMap: PropTypes.func.isRequired,
    setMapView: PropTypes.func.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    mapControlsHidden: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    return {
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsHidden: state.view.get("mapControlsHidden")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        completeInitialLoad: bindActionCreators(appActions.completeInitialLoad, dispatch),
        checkBrowserFunctionalities: bindActionCreators(
            appActions.checkBrowserFunctionalities,
            dispatch
        ),
        loadInitialData: bindActionCreators(mapActions.loadInitialData, dispatch),
        activateDefaultLayers: bindActionCreators(mapActions.activateDefaultLayers, dispatch),
        runUrlConfig: bindActionCreators(appActions.runUrlConfig, dispatch),
        initializeMap: bindActionCreators(mapActions.initializeMap, dispatch),
        setMapView: bindActionCreators(mapActions.setMapView, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
