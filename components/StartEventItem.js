import React from "react";
import { StyleSheet, Image, View, Text, Pressable } from "react-native";
import { Switch } from "react-native";
import colors from "../config/color";

function StartEventItem({
  title,
  description,
  ImageComponent,
  onPress,
  subtitle,
  noInfo,
}) {
  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPress}>
        <View style={styles.container}>
          {ImageComponent}
          {!noInfo && (
            <View style={styles.infoContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {description && (
                <Text style={styles.description}>{description}</Text>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 0,
    marginBottom: 0,
    padding: 8,
    borderWidth: 1,
    backgroundColor: colors.white,
    borderColor: colors.lightGrey,
    borderRadius: 40,
    // For Android
    elevation: 3,
    // For iOS
    shadowColor: colors.darkGrey,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2.84,
  },
  container: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  infoContainer: {
    flexShrink: 1,
    flexGrow: 1,
    paddingLeft: 8,
    textAlign: "center",
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
    fontWeight: "normal",
    textAlign: "left",
    fontSize: 16,
    color: colors.darkGrey,
  },
  link: {
    color: "dodgerblue",
    marginTop: 8,
  },
});

export default StartEventItem;
