/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { expect } from "chai";
import MapUtil from "utils/MapUtil";
import * as appStrings from "constants/appStrings";

describe("Map Util Tests", () => {
    describe("MapUtil.getStormColor returns a hex color string based on storm wind speed in knots", () => {
        it("returns tropical depression color for values <= 33", () => {
            let speeds = [0, 15, 32, 33];
            for (let i in speeds) {
                expect(MapUtil.getStormColor(speeds[i])).to.equal(
                    appStrings.STORM_COLORS.tropical_depression
                );
            }
        });
        it("returns tropical storm color for values [34 - 63]", () => {
            let speeds = [34, 50, 62, 63];
            for (let i in speeds) {
                expect(MapUtil.getStormColor(speeds[i])).to.equal(
                    appStrings.STORM_COLORS.tropical_storm
                );
            }
        });
        it("returns cat 1 color for values [64 - 82]", () => {
            let speeds = [64, 70, 81, 82];
            for (let i in speeds) {
                expect(MapUtil.getStormColor(speeds[i])).to.equal(appStrings.STORM_COLORS.cat_1);
            }
        });
        it("returns cat 2 color for values [83 - 95]", () => {
            let speeds = [83, 88, 94, 95];
            for (let i in speeds) {
                expect(MapUtil.getStormColor(speeds[i])).to.equal(appStrings.STORM_COLORS.cat_2);
            }
        });
        it("returns cat 3 color for values [96 - 112]", () => {
            let speeds = [96, 100, 111, 112];
            for (let i in speeds) {
                expect(MapUtil.getStormColor(speeds[i])).to.equal(appStrings.STORM_COLORS.cat_3);
            }
        });
        it("returns cat 4 color for values [113 - 136]", () => {
            let speeds = [113, 120, 135, 136];
            for (let i in speeds) {
                expect(MapUtil.getStormColor(speeds[i])).to.equal(appStrings.STORM_COLORS.cat_4);
            }
        });
        it("returns cat 5 color for values >= 137", () => {
            let speeds = [137, 140, 150, 200];
            for (let i in speeds) {
                expect(MapUtil.getStormColor(speeds[i])).to.equal(appStrings.STORM_COLORS.cat_5);
            }
        });
    });
});
