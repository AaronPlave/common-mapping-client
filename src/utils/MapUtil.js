import MapUtilCore from "_core/utils/MapUtil";
import * as appStrings from "constants/appStrings";

export default class MapUtil extends MapUtilCore {
    /**
     * Return a hex color string representing
     * a strom's intensity.
     *
     * @static
     * @param {number} intensity wind speed intensity in knots
     * @returns {string} hex color string
     * @memberof MapUtil
     */
    static getStormColor(intensity) {
        if (intensity <= 33) {
            return appStrings.STORM_COLORS.tropical_depression;
        } else if (intensity > 33 && intensity <= 63) {
            return appStrings.STORM_COLORS.tropical_storm;
        } else if (intensity > 63 && intensity <= 82) {
            return appStrings.STORM_COLORS.cat_1;
        } else if (intensity > 82 && intensity <= 95) {
            return appStrings.STORM_COLORS.cat_2;
        } else if (intensity > 95 && intensity <= 112) {
            return appStrings.STORM_COLORS.cat_3;
        } else if (intensity > 112 && intensity <= 136) {
            return appStrings.STORM_COLORS.cat_4;
        } else if (intensity > 136) {
            return appStrings.STORM_COLORS.cat_5;
        }

        return "#ffffff";
    }
}
