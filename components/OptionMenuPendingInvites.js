import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

const OptionMenuPendingInvites = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const goToInvitesHistory = () => {
    closeMenu();
    navigation.navigate("invite history");
  };

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
        <Menu.Item onPress={goToInvitesHistory} title={t("invites history")} />
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
    backgroundColor: "#ffffff", // Ensures white background
    borderRadius: 8, // Optional rounded corners for modern look
  },
});

export default OptionMenuPendingInvites;
