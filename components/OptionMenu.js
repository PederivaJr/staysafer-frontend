import React, { useContext, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Menu, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import storage from "../auth/storage";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import logoutApi from "../api/logout";

function OptionMenu(props) {
  const [visible, setVisible] = useState(false);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const goProfileScreen = () => {
    closeMenu();
    navigation.navigate("profile");
  };
  const goSetupScreen = () => {
    closeMenu();
    navigation.navigate("setup");
  };
  const goBeacons = () => {
    closeMenu();
    navigation.navigate("beacons (BETA)");
  };
  const goBeaconsNavigation = () => {
    closeMenu();
    navigation.navigate("navigation (BETA)");
  };

  const logoutUser = async () => {
    closeMenu();
    // Call logout API
    const abortController = new AbortController();
    const result = await logoutApi.logout({
      signal: abortController.signal,
    });

    console.log("logout API: ", JSON.stringify(result, null, 2));
    await storage.removeUser();
    authContext.setUser(null);

    return () => {
      abortController.abort();
    };
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        style={styles.menu}
        contentStyle={{ backgroundColor: "#fff" }}
        anchor={
          <Button onPress={openMenu} style={styles.menuButton}>
            <MaterialCommunityIcons
              size={24}
              style={styles.icon}
              name="dots-vertical"
            />
          </Button>
        }
        anchorPosition="bottom"
        statusBarHeight={36}
      >
        <Menu.Item onPress={goProfileScreen} title={t("header profile")} />
        <Menu.Item onPress={goSetupScreen} title={t("header setup")} />
        {/* <Menu.Item onPress={goBeacons} title="beacons (BETA)" />
        <Menu.Item onPress={goBeaconsNavigation} title="navigation (BETA)" /> */}
        <Menu.Item onPress={logoutUser} title={t("header logout")} />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  menuButton: {
    padding: 0,
    margin: 0,
  },
  icon: {
    color: colors.white,
  },
  menu: {
    backgroundColor: colors.white, // White background for the menu
    borderRadius: 8, // Optional: Add rounded corners
    elevation: 4, // Optional: Add a shadow for a more modern look
  },
});

export default OptionMenu;
