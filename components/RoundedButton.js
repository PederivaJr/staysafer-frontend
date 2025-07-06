import React from "react";
import { StyleSheet, Text, TouchableHighlight } from "react-native";
import colors from "../config/color";

function RoundedButton({
  title,
  onPress,
  backgroundColor,
  borderColor,
  color,
  disabled,
}) {
  return (
    <TouchableHighlight
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor || styles.button.backgroundColor,
          borderColor: borderColor || styles.button.borderColor,
        },
      ]}
      onPress={!disabled ? onPress : null}
    >
      <Text
        style={[
          styles.text,
          {
            color: color || styles.button.color,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brightGreen,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    borderColor: colors.green,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: "80%",
    marginVertical: 10,
    color: colors.white,
  },
  buttonDisabled: {
    backgroundColor: "#f0f0f0",
    color: colors.grey,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: "80%",
    marginVertical: 10,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "normal",
  },
});

export default RoundedButton;
