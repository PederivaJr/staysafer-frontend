import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const OptionMenuManageRoles = ({ availableRoles, onSelectAction, contact }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // Set menu options and actions dynamically
  const { menuOptions, menuActions } = useMemo(() => {
    let options = availableRoles.map((role) =>
      role === "remove"
        ? t("remove user")
        : role === "evac"
          ? t("evac")
          : role === "revoke"
            ? t("revoke")
            : `${t("set as")} ${t(role)}`
    );

    let actions = availableRoles.map((role) => () => onSelectAction(role));

    // If the user is not a manager, restrict options to "remove user"
    if (
      contact.plan?.name &&
      !["professional", "advanced", "basic"].includes(
        contact.plan.name.toLowerCase()
      )
    ) {
      options = availableRoles
        .filter((role) => role === "remove")
        .map(() => t("remove user"));
      actions = options.map(() =>
        t("remove user") ? () => onSelectAction("remove") : null
      );
    }

    return { menuOptions: options, menuActions: actions };
  }, [availableRoles, contact, t, onSelectAction]);

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
        {menuOptions.map((option, index) => (
          <Menu.Item
            key={index}
            onPress={() => {
              closeMenu();
              menuActions[index]();
            }}
            title={option}
          />
        ))}
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
    borderRadius: 8, // Rounded corners for modern design
  },
});

export default OptionMenuManageRoles;
