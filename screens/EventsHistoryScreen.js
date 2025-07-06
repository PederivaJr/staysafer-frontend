import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../config/color";
import "../config/lang/i18n";
import Screen from "../components/Screen";
import EventsHistoryList from "../components/EventsHistoryList";
import { vh } from "react-native-expo-viewport-units";

function EventsHistoryScreen() {
  return (
    <View style={styles.container}>
      <EventsHistoryList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lighterGrey,
  },
});

export default EventsHistoryScreen;
