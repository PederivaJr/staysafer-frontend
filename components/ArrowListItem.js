import React from "react";
import { StyleSheet, View, Text, TouchableHighlight } from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import colors from "../config/color";

function ArrowListItem({ title, description, ImageComponent, onPress }) {
  return (
    <TouchableHighlight
      underlayColor={colors.lightGrey}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View>
        <View style={styles.container}>
          <View style={styles.leftContainer}>{ImageComponent}</View>
          <View style={styles.midContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text>{description}</Text>
          </View>
          <View style={styles.rightContainer}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={36}
              color="#999"
            />
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  leftContainer: {
    flexDirection: "row",
  },
  rightContainer: {},
  midContainer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  doubleIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  doubleIconLeft: {},
  doubleIconRight: {},
  iconStatus: {
    fontSize: 22,
  },
  title: {
    fontWeight: "bold",
  },
});

export default ArrowListItem;
