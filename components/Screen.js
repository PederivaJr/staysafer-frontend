import React from "react";
import Constants from "expo-constants";
import { StyleSheet, SafeAreaView, View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

function Screen(props) {
  return (
    <View style={styles.statusBarWrapper}>
      <StatusBar translucent={true} style="dark" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>{props.children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  statusBarWrapper: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 0 : Constants.statusBarHeight,
  },
  container: {
    flex: 1,
  },
});

export default Screen;
