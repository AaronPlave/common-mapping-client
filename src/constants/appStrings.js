export const ALERTS = {
    ZOOM_TO_LAYER_FAILED: {
        title: "Zoom to Layer Failed",
        formatString: "Unable to find layer {LAYER}.",
        severity: 3
    }
};

export const VECTOR_STYLE_STORM = "storm";

export const STORM_CATEGORIES = {
    tropical_depression: { color: "#1976d2", textColor: "black", label: "Tropical Depression" },
    tropical_storm: { color: "#26c6da", textColor: "white", label: "Tropical Storm" },
    cat_1: { color: "#ffee58", textColor: "black", label: "Category 1 Hurricane" },
    cat_2: { color: "#ffca28", textColor: "black", label: "Category 2 Hurricane" },
    cat_3: { color: "#ffb300", textColor: "black", label: "Category 3 Hurricane" },
    cat_4: { color: "#fb8c00", textColor: "white", label: "Category 4 Hurricane" },
    cat_5: { color: "#e53935", textColor: "white", label: "Category 5 Hurricane" }
};
