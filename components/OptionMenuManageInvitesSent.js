import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const OptionMenuManageInvitesSent = ({ onSelectAction }) => {
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
                size={24}
                color="#999"
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
            onSelectAction("remove");
          }}
          title={t("remove")}
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
    backgroundColor: "#ffffff", // Ensures a white background
    borderRadius: 8, // Optional: Rounded corners for a modern look
  },
});

export default OptionMenuManageInvitesSent;
