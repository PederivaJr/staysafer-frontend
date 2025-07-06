import React from "react";
import { Marker, Circle, Callout } from "react-native-maps";
import { Image } from "react-native";
import colors from "../config/color";

const MapMarker = ({ marker, onPress, strokeColor, isSelected }) => {
  return (
    <>
      <Marker
        coordinate={marker.coordinate}
        onPress={onPress}
        anchor={{ x: 0.5, y: 1 }}
        tracksViewChanges={true}
      >
        <Image
          source={require("../assets/evac-point-2.png")}
          style={{
            width: 40,
            height: 40,
          }}
          resizeMode="contain"
        />
        {isSelected && (
          <Callout tooltip>{/* CustomCallout content goes here */}</Callout>
        )}
      </Marker>
      <Circle
        center={marker.coordinate}
        radius={parseInt(marker.radius)}
        strokeWidth={isSelected ? 3 : 2} // Thicker stroke when selected
        strokeColor={strokeColor}
        fillColor={isSelected ? `${strokeColor}20` : "transparent"} // Slight fill when selected
      />
    </>
  );
};

export default MapMarker;
