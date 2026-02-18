import React from "react";
import { View } from "react-native";

const MapView = React.forwardRef((props: any, ref: any) => <View {...props} ref={ref} />);
const Marker = (props: any) => null;

export { MapView as default, Marker };
