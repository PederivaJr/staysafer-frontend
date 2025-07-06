import React from "react";
import { StyleSheet, Image, View, Text, Pressable } from "react-native";
import { Switch } from "react-native";
import colors from "../config/color";

function SetupListItem({
  title,
  description,
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
        <View style={styles.leftContainer}>{ImageComponent}</View>
        <View style={styles.midContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text>{subtitle}</Text>}
          {description && <Text>{description}</Text>}
          {goToManageSafetyMethods && (
            <Pressable onPress={onPress}>
              <View>
                <Text style={styles.link}>{goToManageSafetyMethods}</Text>
              </View>
            </Pressable>
          )}
        </View>
        <View style={styles.rightContainer}>
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
    borderBottomColor: colors.lightGrey,
    flexGrow: 0,
    gap: 8,
  },
  leftContainer: {},
  midContainer: {
    alignItems: "flex-start",
    flexGrow: 1,
    flexShrink: 1,
  },
  rightContainer: {},
  iconStatus: {
    fontSize: 22,
    padding: 4,
  },
  title: {
    fontWeight: "bold",
  },
  link: {
    color: "dodgerblue",
    marginTop: 8,
  },
});

export default SetupListItem;
