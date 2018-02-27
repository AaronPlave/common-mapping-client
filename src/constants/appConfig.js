/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import * as coreConfig from "_core/constants/appConfig";
import * as appStringsCore from "_core/constants/appStrings";

// the config as defined by CMC Core
const CORE_CONFIG = Immutable.fromJS(coreConfig);

// this config is defined in `src/config.js` for in ops changes
const OPS_CONFIG = Immutable.fromJS(window.APPLICATION_CONFIG);

// define your overrides for Core config here
const APP_CONFIG = Immutable.fromJS({
    APP_TITLE: "Common Mapping Client Walkthrough",
    DEFAULT_PROJECTION: appStringsCore.PROJECTIONS.webmercator,
    URLS: {
        layerConfig: [
            {
                url: "//gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml",
                type: "wmts/xml"
            },
            {
                url: "default-data/demo-default-data/layers.json",
                type: "json"
            }
        ],
        paletteConfig: "default-data/demo-default-data/palettes.json"
    },
    DEFAULT_MAP_EXTENT: [-20037508.34 * 1.5, -20037508.34, 20037508.34 * 1.5, 20037508.34],
    DEFAULT_BBOX_EXTENT: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
    GIBS_IMAGERY_RESOLUTIONS: [
        156543.03390625,
        78271.51696402043,
        39135.75848201021,
        19567.879241005106,
        9783.939620502553,
        4891.969810251277,
        2445.9849051256383,
        1222.9924525628192,
        611.4962262814096,
        305.7481131407048,
        152.8740565703524,
        76.4370282851762,
        38.2185141425881,
        19.10925707129405
    ],
    MAX_RESOLUTION: 156543.03390625
});

// define and export the final config
const appConfig = CORE_CONFIG.mergeDeep(APP_CONFIG)
    .mergeDeep(OPS_CONFIG)
    .toJS();
export default appConfig;
