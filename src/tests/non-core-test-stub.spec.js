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
    describe("MapUtil.getStormCategory returns a categorization based on storm wind speed in knots", () => {
        it("returns tropical depression for values <= 33", () => {
            let speeds = [0, 15, 32, 33];
            for (let i in speeds) {
                let cat = MapUtil.getStormCategory(speeds[i]);
                expect(cat.label).to.equal(appStrings.STORM_CATEGORIES.tropical_depression.label);
            }
        });
        it("returns tropical storm for values [34 - 63]", () => {
            let speeds = [34, 50, 62, 63];
            for (let i in speeds) {
                let cat = MapUtil.getStormCategory(speeds[i]);
                expect(cat.label).to.equal(appStrings.STORM_CATEGORIES.tropical_storm.label);
            }
        });
        it("returns cat 1 for values [64 - 82]", () => {
            let speeds = [64, 70, 81, 82];
            for (let i in speeds) {
                let cat = MapUtil.getStormCategory(speeds[i]);
                expect(cat.label).to.equal(appStrings.STORM_CATEGORIES.cat_1.label);
            }
        });
        it("returns cat 2 for values [83 - 95]", () => {
            let speeds = [83, 88, 94, 95];
            for (let i in speeds) {
                let cat = MapUtil.getStormCategory(speeds[i]);
                expect(cat.label).to.equal(appStrings.STORM_CATEGORIES.cat_2.label);
            }
        });
        it("returns cat 3 for values [96 - 112]", () => {
            let speeds = [96, 100, 111, 112];
            for (let i in speeds) {
                let cat = MapUtil.getStormCategory(speeds[i]);
                expect(cat.label).to.equal(appStrings.STORM_CATEGORIES.cat_3.label);
            }
        });
        it("returns cat 4 for values [113 - 136]", () => {
            let speeds = [113, 120, 135, 136];
            for (let i in speeds) {
                let cat = MapUtil.getStormCategory(speeds[i]);
                expect(cat.label).to.equal(appStrings.STORM_CATEGORIES.cat_4.label);
            }
        });
        it("returns cat 5 for values >= 137", () => {
            let speeds = [137, 140, 150, 200];
            for (let i in speeds) {
                let cat = MapUtil.getStormCategory(speeds[i]);
                expect(cat.label).to.equal(appStrings.STORM_CATEGORIES.cat_5.label);
            }
        });
    });
});
