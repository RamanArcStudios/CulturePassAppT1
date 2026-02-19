import React from "react";
import { View } from "react-native";

const MapView = React.forwardRef((props: any, ref: any) => <View {...props} ref={ref} />);
MapView.displayName = "MapView";

const Marker = (_props: any) => null;

export { MapView as default, Marker };
