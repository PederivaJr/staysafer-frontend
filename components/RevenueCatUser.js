import React from "react";
import { View, Text, StyleSheet } from "react-native";
import RevenueCatProvider, { UserState } from "../providers/RevenueCatProvider";

const RevenueCatUser = ({ revenueCatUser }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>Cookies: {revenueCatUser.cookies}</Text>
      <Text style={styles.text}>
        Items: {revenueCatUser.items?.length === 0 && "No Items purchased yet!"}{" "}
        {revenueCatUser.items.join(", ")}
      </Text>
      <Text style={styles.text}>
        Pro Features: {revenueCatUser.pro ? "True" : "False"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    shadowColor: "#",
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  text: {
    fontSize: 18,
    color: "#EA3C4A",
    paddingVertical: 6,
  },
});

export default RevenueCatUser;
