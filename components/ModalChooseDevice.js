import React, { useCallback } from "react";
import {
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import Modal from "react-native-modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { vh } from "react-native-expo-viewport-units";
import { useTranslation } from "react-i18next";
import colors from "../config/color";

const DeviceModalListItem = ({ item, connectToPeripheral, closeModal }) => {
  const { t } = useTranslation();

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);

  return (
    <TouchableOpacity
      onPress={connectAndCloseModal}
      style={styles.ctaButton}
      accessibilityLabel={`Connect to ${item.item.name ?? item.item.localName ?? "No name"}`}
    >
      <Text style={styles.ctaButtonText}>
        {item.item.name ?? item.item.localName ?? "no Name"}
      </Text>
    </TouchableOpacity>
  );
};

const ModalChooseDevice = ({
  devices,
  isVisible,
  connectToPeripheral,
  closeModal,
}) => {
  const { t } = useTranslation();
  const renderDeviceModalListItem = useCallback(
    ({ item }) => (
      <DeviceModalListItem
        item={item}
        connectToPeripheral={connectToPeripheral}
        closeModal={closeModal}
      />
    ),
    [closeModal, connectToPeripheral]
  );

  return (
    <Modal isVisible={isVisible} onBackdropPress={closeModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitle}>
              <MaterialCommunityIcons
                size={20}
                style={styles.shareIcon}
                name="account-plus-outline"
              />
              <Text style={styles.modalTitle}>{t("manage beacons")}</Text>
            </View>
            <Pressable style={styles.modalHeaderClose} onPress={closeModal}>
              <Text>X</Text>
            </Pressable>
          </View>
          <View style={styles.modalList}>
            <Text style={styles.modalTitleText}>
              {t("tap on a device to connect")}
            </Text>
            <FlatList
              contentContainerStyle={styles.modalFlatlistContiner}
              data={devices}
              renderItem={renderDeviceModalListItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.lighterGrey,
    minHeight: vh(100),
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    height: 48,
    borderColor: "#555",
    borderBottomWidth: 1,
    paddingRight: 30,
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: 10,
  },
  error: {
    color: colors.darkRed,
  },
  btnContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  checkboxContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkboxText: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  checkbox: {
    flex: 0,
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  modalContent: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.lighterGrey,
    width: "100%",
    padding: 0,
  },
  closeButton: {},
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    marginBottom: 16,
    width: "100%",
  },
  modalHeaderTitle: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 8,
  },
  modalHeaderClose: {
    borderColor: colors.grey,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  modalList: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    marginLeft: 8,
    fontSize: 16,
  },
  modalFooter: {
    flex: 0,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  inputTextWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
    width: "100%",
  },
  addContactContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    marginHorizontal: 0,
  },
  addContact: {},
  infinity: {
    fontSize: 18,
  },
  evacLeft: {
    borderRadius: 16,
    backgroundColor: colors.lighterGrey,
    marginRight: 0,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  fullWidth: {
    width: "80%",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalFlatlistContiner: {
    flex: 0,
    justifyContent: "center",
  },
  modalTitleText: {
    marginTop: 40,
    fontSize: 30,
    fontWeight: "bold",
    marginHorizontal: 20,
    textAlign: "center",
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default ModalChooseDevice;
