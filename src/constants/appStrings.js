export const ALERTS = {
    ZOOM_TO_LAYER_FAILED: {
        title: "Zoom to Layer Failed",
        formatString: "Unable to find layer {LAYER}.",
        severity: 3
    }
};

export const VECTOR_STYLE_STORM = "storm";

export const STORM_COLORS = {
    tropical_depression: "#1976d2",
    tropical_storm: "#26c6da",
    cat_1: "#ffee58",
    cat_2: "#ffca28",
    cat_3: "#ffb300",
    cat_4: "#fb8c00",
    cat_5: "#e53935"
};

export const STORM_TEXT_COLOR_CONTRAST_MAP = {
    tropical_depression: false,
    tropical_storm: false,
    cat_1: false,
    cat_2: false,
    cat_3: false,
    cat_4: true,
    cat_5: true
};
