import MapUtilCore from "_core/utils/MapUtil";
import * as appStrings from "constants/appStrings";

export default class MapUtil extends MapUtilCore {
    /**
     * Return a storm category describing
     * a strom's intensity.
     *
     * @static
     * @param {number} intensity wind speed intensity in knots
     * @returns {object} story category description
     * - label - {string} category label
     * - color - {string} hex color string
     * @memberof MapUtil
     */
    static getStormCategory(intensity) {
        if (intensity <= 33) {
            return appStrings.STORM_CATEGORIES.tropical_depression;
        } else if (intensity > 33 && intensity <= 63) {
            return appStrings.STORM_CATEGORIES.tropical_storm;
        } else if (intensity > 63 && intensity <= 82) {
            return appStrings.STORM_CATEGORIES.cat_1;
        } else if (intensity > 82 && intensity <= 95) {
            return appStrings.STORM_CATEGORIES.cat_2;
        } else if (intensity > 95 && intensity <= 112) {
            return appStrings.STORM_CATEGORIES.cat_3;
        } else if (intensity > 112 && intensity <= 136) {
            return appStrings.STORM_CATEGORIES.cat_4;
        } else if (intensity > 136) {
            return appStrings.STORM_CATEGORIES.cat_5;
        }

        return "#ffffff";
    }
}
