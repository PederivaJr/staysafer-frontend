import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/color";

function RoundedIcon({ name, backgroundColor, color, onPress, size }) {
  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      style={[styles.touch, { backgroundColor: backgroundColor }]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            borderColor: color,
            backgroundColor: backgroundColor,
            width: size,
            height: size,
          },
        ]}
      >
        <MaterialCommunityIcons
          size={size / 2}
          style={[
            styles.logo,
            { color: color, backgroundColor: backgroundColor },
          ]}
          name={name}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 120,
    height: 120,
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
    borderColor: colors.grey,
    borderWidth: 4,
    backgroundColor: colors.lightGrey,
  },
  logo: {
    color: colors.white,
    backgroundColor: colors.lightGrey,
  },
  touch: {
    backgroundColor: colors.lightGrey,
  },
});

export default RoundedIcon;
