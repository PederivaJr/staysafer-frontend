import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Toast from "react-native-root-toast";
import { AuthContext } from "../context/AuthContext";
import duplicateListApi from "../api/duplicateList";

const OptionMenuEvacListDrill = ({ onSelectAction }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const authContext = useContext(AuthContext);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const duplicateAlarmEvacList = async () => {
    const evacListAlarm = authContext.evacLists?.find(
      (list) => list.name === "default alarm"
    );
    const abortController = new AbortController();

    const result = await duplicateListApi.duplicateList(evacListAlarm.list_id, {
      signal: abortController.signal,
    });

    console.log(
      "Duplicate Evac List API Response: ",
      JSON.stringify(result, null, 2)
    );
    if (result.ok && result.data) {
      Toast.show(t("list duplicated"), {
        duration: Toast.durations.LONG,
      });
      authContext.setSelectedUsersDrill(result.data.selected_users);
    }
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
            duplicateAlarmEvacList();
          }}
          title={t("duplicate alarm evac list")}
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

export default OptionMenuEvacListDrill;
