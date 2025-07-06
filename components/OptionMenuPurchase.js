import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const OptionMenuPurchase = ({ onSelectAction }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

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
        contentStyle={styles.menuContent}
      >
        <Menu.Item
          onPress={() => {
            closeMenu();
            onSelectAction("restore");
          }}
          title={t("restore")}
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
    backgroundColor: "#ffffff", // White background
    borderRadius: 8, // Rounded corners
  },
});

export default OptionMenuPurchase;
