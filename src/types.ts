type layerKind = ["reference"] | ["namespace"] | ["property", string];
type HTMLCheckbox = (HTMLInputElement & {type: "checkbox"});
type HTMLColor = (HTMLInputElement & {type: "color"});
type PanelPlace = "layer-container";
type MouseMode = "toggle" | "flag";