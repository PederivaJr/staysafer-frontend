import React from "react";
import { StyleSheet, Image, View, Text, Pressable } from "react-native";
import { Switch } from "react-native";
import colors from "../config/color";

function SystemSetupListItem({
  title,
  description,
  italic_description,
  ImageComponent,
  value,
  onValueChange,
  onChange,
  onPress,
  disabled,
  subtitle,
  goToManageSafetyMethods,
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {ImageComponent}
          <View style={styles.infoContainer}>
            {title && (
              <Text style={!disabled ? styles.title : styles.titleFaded}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={!disabled ? styles.description : styles.textFaded}>
                {subtitle}
              </Text>
            )}
            {description && (
              <Text style={!disabled ? styles.description : styles.textFaded}>
                {description}
              </Text>
            )}
            {italic_description && (
              <Text
                style={!disabled ? styles.italicDescription : styles.textFaded}
              >
                {italic_description}
              </Text>
            )}
            {goToManageSafetyMethods && (
              <Pressable onPress={onPress}>
                <View>
                  <Text style={styles.link}>{goToManageSafetyMethods}</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.iconContainer}>
          <Switch
            value={value}
            onValueChange={onValueChange}
            onChange={onChange}
            disabled={disabled}
            thumbColor={
              disabled === true
                ? colors.lighterGrey
                : value === true
                ? colors.brightGreen
                : colors.lightGrey
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 0,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    flexGrow: 0,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexGrow: 1,
    maxWidth: "85%",
  },
  iconContainer: {
    flexDirection: "row",
    marginLeft: 8,
    flexGrow: 0,
  },
  infoContainer: {
    flexGrow: 0,
    marginLeft: 8,
  },
  iconStatus: {
    fontSize: 22,
    padding: 4,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 20,
  },
  title: {
    fontWeight: "bold",
  },
  titleFaded: {
    fontWeight: "normal",
    color: "#ccc",
  },
  textFaded: {
    color: "#bbb",
  },
  link: {
    color: "dodgerblue",
    paddingVertical: 8,
  },
  italicDescription: {
    fontStyle: "italic",
  },
});

export default SystemSetupListItem;
