import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import colors from "../config/color";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const CustomCallout = ({ marker, onUpdate, onDelete, onClose }) => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  const markerStatus = marker.assigned_to
    ? marker.assigned_to === authContext.user.id
      ? t("assigned to you")
      : t("assigned")
    : t("not assigned");

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
          <Icon name="close" size={20} color={colors.dark} />
        </TouchableOpacity>

        <Text style={styles.title}>
          {marker.title} ({markerStatus})
        </Text>
        <Text style={styles.description}>{marker.description}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={onUpdate}>
            <Text style={styles.buttonText}>
              {marker.active ? t("disable") : t("enable")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onDelete}>
            <Text style={[styles.buttonText, styles.buttonTextDelete]}>
              {t("delete")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "50%",
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 1000,
  },
  bubble: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    paddingTop: 30,
    width: width - 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    position: "relative",
    opacity: 0.9,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 4,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 4,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  button: {
    marginVertical: 2,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
    backgroundColor: "#dadada",
  },
  buttonText: {
    color: colors.black,
    fontSize: 16,
  },
  buttonTextDelete: {
    color: colors.darkRed,
  },
  arrow: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
});

export default CustomCallout;
