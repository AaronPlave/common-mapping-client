import MapUtilCore from "_core/utils/MapUtil";

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
        let colors = {
            tropical_depression: "#1976d2",
            tropical_storm: "#26c6da",
            cat_1: "#ffee58",
            cat_2: "#ffca28",
            cat_3: "#ffb300",
            cat_4: "#fb8c00",
            cat_5: "#e53935"
        };

        if (intensity <= 33) {
            return colors.tropical_depression;
        } else if (intensity > 33 && intensity <= 63) {
            return colors.tropical_storm;
        } else if (intensity > 63 && intensity <= 82) {
            return colors.cat_1;
        } else if (intensity > 82 && intensity <= 95) {
            return colors.cat_2;
        } else if (intensity > 95 && intensity <= 112) {
            return colors.cat_3;
        } else if (intensity > 112 && intensity <= 136) {
            return colors.cat_4;
        } else if (intensity > 136) {
            return colors.cat_5;
        }

        return "#ffffff";
    }
}
