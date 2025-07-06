import React from "react";
import { View, Text, Button, StyleSheet, Pressable, Image } from "react-native";
import colors from "../config/color";
import Modal from "react-native-modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RoundedButton from "./RoundedButton";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";

const ProminentDisclosureCamera = ({ visible, onAgree, onSkip }) => {
  const { t, i18n } = useTranslation();

  return (
    <Modal isVisible={visible}>
      <ScrollView>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="camera" size={36} color={colors.darkerGrey} />
            <Text style={styles.title}>{t("camera disclosure")}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.description}>
            {t("camera disclosure desc")}
            </Text>
          </View>
          <Image
            source={require("../assets/images/camera.png")}
            style={styles.image}
          />
          <View style={styles.buttonContainer}>
            <RoundedButton
                title={t("accept")}
                style={styles.fullWidth}
                onPress={onAgree}
                backgroundColor={colors.darkerGrey}
                borderColor={colors.black}
            />
            <RoundedButton
              title={t("decline")}
              style={styles.confirmButton}
              onPress={onSkip}
              backgroundColor={colors.grey}
              borderColor={colors.lightGrey}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: colors.white,
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 8,
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
  modalText: {
    margin: 8,
    padding: 8,
    fontSize: 14,
  },
  modalFooter: {
    flex: 0,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "",
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 24,
  },
  btnContainer: {
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  fullWidth: {
    width: 96,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    alignItems: "center",
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.darkerGrey
  },
  description: {
    fontSize: 14,
    textAlign: "left",
  },
  listSection: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  listIcon: {
    marginRight: 8, 
  },
  bulletPointsContainer: {
    flexDirection: "column",
  },
  bulletPoint: {
    marginTop: 5, 
  },
  subText: {
    marginBottom: 5, 
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#0000FF",
    textDecorationLine: "underline",
    fontSize: 12,
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center"
  },

  button: {
    flex: 1, 
    paddingVertical: 12,
    paddingHorizontal: 35, 
    borderRadius: 5,
    margin: 10, 
  },
  singleButtonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  titleContainer : {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 16
  }
});

export default ProminentDisclosureCamera;
