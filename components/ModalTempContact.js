import React, { useContext, useRef, useState } from "react";
import { StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import Modal from "react-native-modal";
import { Formik } from "formik";
import * as Yup from "yup";
import CheckBox from "expo-checkbox";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RoundedButton from "../components/RoundedButton";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import createTempContactApi from "../api/createTempContact";
import cache from "../utility/cache";
import Toast from "react-native-root-toast";
import * as globals from "../config/globals";
import { vh } from "react-native-expo-viewport-units";
import { AuthContext } from "../context/AuthContext";

function ModalTempContact({ isVisible, onClose, list }) {
  const { t } = useTranslation();
  const validationSchemaTemp = Yup.object().shape({
    name: Yup.string()
      .required(t("validation required field"))
      .min(2, t("validation min length"))
      .label(t("name")),
    count: Yup.number()
      .positive(t("validation positive number"))
      .integer(t("validation integer"))
      .required(t("validation required field"))
      .label(t("count")),
    phone: Yup.string()
      .matches(globals.PHONE_REGEX, t("validation invalid phone"))
      .label(t("phone")),
    expire: Yup.number()
      .positive(t("validation positive number"))
      .integer(t("validation integer"))
      .optional()
      .label(t("expires after days")),
  });
  const [addTempContactToSelected, setAddTempContactToSelected] =
    useState(true);
  const [activeIndexTemp, setActiveIndexTemp] = useState(null);
  const nameInputRef = useRef();
  const countInputRef = useRef();
  const phoneTempInputRef = useRef();
  const expireInputRef = useRef();
  const authContext = useContext(AuthContext);

  const handleSubmitTemp = async (
    { name, count, expire, phone },
    { resetForm, setFieldValue }
  ) => {
    // Convert count and expire to numbers
    count = parseInt(count, 10);
    expire = expire ? parseInt(expire, 10) : null;
    //if user is not added to phone, add it to local contacts
    let tempContact = {};
    tempContact.name = name;
    tempContact.count = count;
    tempContact.phone = phone;
    tempContact.expire = expire;
    tempContact.list_id = list.list_id;
    //adding contact to selected users done with backend event
    addTempContactToSelected
      ? (tempContact.add_to_selected = true)
      : (tempContact.add_to_selected = false);
    const abortControllerTempContact = new AbortController();
    const result = await createTempContactApi.createTempContact(tempContact, {
      signal: abortControllerTempContact.signal,
    });
    console.log("temp user create API: ", JSON.stringify(result, null, 2));
    if (result.ok) {
      Toast.show(t("temp contact created"), {
        duration: Toast.durations.SHORT,
      });
      if (result.data?.temp_contacts)
        authContext.setTempContacts(result.data.temp_contacts);
      if (result.data?.selected_users) {
        const listForSelected = authContext.evacLists.find(
          (item) => item.list_id === list.list_id
        );
        if (listForSelected.name.includes("alarm"))
          authContext.setSelectedUsers(result.data.selected_users);
        if (listForSelected.name.includes("drill"))
          authContext.setSelectedUsersDrill(result.data.selected_users);
      }
      if (result.data?.selected_users_checkins)
        authContext.setSelectedUsersCheckins(
          result.data.selected_users_checkins
        );
      onClose();
    }

    return () => {
      abortControllerTempContact.abort();
    };
  };

  const inputsTemp = () => [
    nameInputRef,
    countInputRef,
    phoneTempInputRef,
    expireInputRef,
  ];

  const editNextInputTemp = () => {
    const activeIndexTemp = getActiveInputIndexTemp();
    if (activeIndexTemp === -1) return;
    const nextIndexTemp = activeIndexTemp + 1;
    if (
      nextIndexTemp < inputsTemp()?.length &&
      inputsTemp()[nextIndexTemp].current != null
    ) {
      setFocusTemp(inputsTemp()[nextIndexTemp], true);
    } else {
      finishEditingTemp();
    }
  };

  const onInputFocusTemp = () => {
    setActiveIndexTemp(getActiveInputIndexTemp());
  };

  const getActiveInputIndexTemp = () => {
    return inputsTemp().findIndex((input) => input.current?.isFocused());
  };

  const finishEditingTemp = () => {
    const activeIndexTemp = getActiveInputIndexTemp();
    if (activeIndexTemp === -1) return;
    setFocusTemp(inputsTemp()[activeIndexTemp], false);
  };

  const setFocusTemp = (textInputRefTemp, shouldFocusTemp) => {
    if (shouldFocusTemp) {
      setTimeout(() => {
        textInputRefTemp.current.focus();
      }, 100);
    } else {
      textInputRefTemp.current.blur();
    }
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitle}>
              <MaterialCommunityIcons
                size={20}
                style={styles.shareIcon}
                name="account-clock-outline"
              />
              <Text style={styles.modalTitle}>{t("add temp contact")}</Text>
            </View>
            <View>
              <Pressable style={styles.modalHeaderClose} onPress={onClose}>
                <Text>X</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.modalList}>
            <Formik
              initialValues={{ name: "", count: "", phone: "", expire: "" }}
              onSubmit={handleSubmitTemp}
              validationSchema={validationSchemaTemp}
            >
              {({ handleChange, handleSubmit, errors }) => (
                <>
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder name")}
                      style={styles.textInput}
                      returnKeyType="next"
                      onSubmitEditing={editNextInputTemp}
                      onFocus={onInputFocusTemp}
                      onChangeText={handleChange("name")}
                      ref={nameInputRef}
                      placeholderTextColor="#333"
                    />
                    {errors.name && (
                      <Text style={styles.error}>{t(errors.name)}</Text>
                    )}
                  </View>
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder count")}
                      style={styles.textInput}
                      returnKeyType="next"
                      onSubmitEditing={editNextInputTemp}
                      onFocus={onInputFocusTemp}
                      onChangeText={handleChange("count")}
                      ref={countInputRef}
                      placeholderTextColor="#333"
                      keyboardType="number-pad"
                    />
                    {errors.count && (
                      <Text style={styles.error}>{t(errors.count)}</Text>
                    )}
                  </View>
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder phone")}
                      style={styles.textInput}
                      returnKeyType="next"
                      onSubmitEditing={editNextInputTemp}
                      onFocus={onInputFocusTemp}
                      onChangeText={handleChange("phone")}
                      ref={phoneTempInputRef}
                      placeholderTextColor="#333"
                      keyboardType="phone-pad"
                      textContentType="phone"
                      autoCapitalize="none"
                    />
                    {errors.phone && (
                      <Text style={styles.error}>{t(errors.phone)}</Text>
                    )}
                  </View>
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder expire")}
                      style={styles.textInput}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit} // Trigger form submission from keyboard
                      onFocus={onInputFocusTemp}
                      onChangeText={handleChange("expire")}
                      ref={expireInputRef}
                      placeholderTextColor="#333"
                      keyboardType="number-pad"
                    />
                    {errors.expire && (
                      <Text style={styles.error}>{t(errors.expire)}</Text>
                    )}
                  </View>
                  <View style={styles.checkboxContainer}>
                    <View style={styles.checkbox}>
                      <CheckBox
                        disabled={false}
                        value={addTempContactToSelected}
                        onValueChange={setAddTempContactToSelected}
                      />
                    </View>
                    <View style={styles.checkboxText}>
                      <Text>{t("add contact to selected list")}</Text>
                    </View>
                  </View>
                  <View style={styles.btnContainer}>
                    <RoundedButton
                      title={t("confirm")}
                      style={styles.fullWidth}
                      onPress={handleSubmit}
                    />
                  </View>
                </>
              )}
            </Formik>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
    color: colors.darkred,
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
});

export default ModalTempContact;
