import React, { useState, useContext } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { vh, vw, em, vmin, vmax } from "react-native-expo-viewport-units";
import Screen from "../components/Screen";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";

function MapSetupScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  return (
    <Screen>
      {loading && (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator
            animating={loading}
            size="large"
            color={colors.brightGreen}
          />
        </View>
      )}
      {!loading && (
        <View style={styles.container}>
          <Text>Map Setup</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.lightGrey,
    minHeight: vh(100),
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
});

export default MapSetupScreen;
