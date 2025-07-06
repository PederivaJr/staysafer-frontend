import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, TextInput, View, StyleSheet } from "react-native";
import colors from "../config/color";

function RoundedTextInput({ icon, ...otherProps }) {
  //console.log("text input props: ", JSON.stringify(otherProps, null, 2));
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialCommunityIcons size={20} style={styles.icon} name={icon} />
      )}
      <TextInput style={styles.textInput} {...otherProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 4,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  icon: {
    marginRight: 16,
    color: colors.grey,
  },
  textInput: {
    fontSize: 18,
    color: colors.darkerGrey,
    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
    textAlignVertical: "top",
  },
});

export default RoundedTextInput;
