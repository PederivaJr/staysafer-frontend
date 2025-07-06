import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const OptionMenuEvacList = ({ onSelectAction }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon={() => (
              <MaterialCommunityIcons
                name="dots-vertical"
                size={28}
                color="#333"
              />
            )}
            onPress={openMenu}
          />
        }
        contentStyle={styles.menuContent} // Custom menu styles
      >
        <Menu.Item
          onPress={() => {
            closeMenu();
            onSelectAction("temp");
          }}
          title={t("add temp contact")}
        />
        <Menu.Item
          onPress={() => {
            closeMenu();
            onSelectAction("clear");
          }}
          title={t("clear list")}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  menuContent: {
    backgroundColor: "#ffffff", // White background for the menu
    borderRadius: 8, // Optional: Rounded corners
  },
});

export default OptionMenuEvacList;
