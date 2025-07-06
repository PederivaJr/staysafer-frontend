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
import createLocalContactApi from "../api/createLocalContact";
import cache from "../utility/cache";
import Toast from "react-native-root-toast";
import * as globals from "../config/globals";
import { vh } from "react-native-expo-viewport-units";
import { AuthContext } from "../context/AuthContext";
import createUserToListApi from "../api/createUserToList";

function ModalLocalContact({ isVisible, onClose }) {
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    firstname: Yup.string()
      .required(t("validation required field"))
      .min(2, t("validation min length"))
      .label(t("first name")),
    lastname: Yup.string()
      .min(2, t("validation min length"))
      .label(t("last name")),
    phone: Yup.string()
      .required(t("validation required field"))
      .matches(globals.PHONE_REGEX, t("validation invalid phone"))
      .label(t("phone")),
  });
  const [addContactToPhone, setAddContactToPhone] = useState(false);
  const [addContactToSelected, setAddContactToSelected] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const firstnameInputRef = useRef();
  const lastnameInputRef = useRef();
  const phoneInputRef = useRef();
  const authContext = useContext(AuthContext);

  let androidOrAppleId = null;
  const evacListAlarm = authContext.evacLists?.find(
    (list) => list.name === "default alarm"
  );
  const handleSubmit = async ({ firstname, lastname, phone }) => {
    //set contact structure for phone
    if (addContactToPhone) {
      let phoneContact = {
        [Contacts.Fields.ContactType]: "person",
        [Contacts.Fields.FirstName]: firstname,
        [Contacts.Fields.LastName]: lastname ? lastname : "",
        [Contacts.Fields.Name]: firstname + (lastname ? " " + lastname : ""),
        [Contacts.Fields.PhoneNumbers]: [
          {
            number: phone ? phone : null,
            label: "mobile",
          },
        ],
      };
      //add new contact to phone
      await Contacts.addContactAsync(phoneContact)
        .then(async (contactId) => {
          androidOrAppleId = contactId;
          $;

          if (addContactToSelected) {
            let contactForSelectedUser = {};
            contactForSelectedUser.list_id = evacListAlarm.list_id;
            contactForSelectedUser.contact_id = androidOrAppleId;
            contactForSelectedUser.firstname = firstname;
            contactForSelectedUser.lastname = lastname;
            contactForSelectedUser.phoneNumbers = [
              {
                number: phone ? phone : null,
                label: "mobile",
              },
            ];
            const abortController = new AbortController();
            //call API
            const result = await createUserToListApi.createUserToList(
              contactForSelectedUser,
              authContext.token?.auth,
              { signal: abortController.signal }
            );
            if (!result.ok && result.data.error_code === "err_token_1") {
              // token expired, logout user
              await logout();
              Toast.show(t(result.data.error_code), {
                duration: Toast.durations.LONG,
              });
              return;
            }
            if (!result.ok && result.data?.error_code) {
              Toast.show(t(result.data.error_code), {
                duration: Toast.durations.SHORT,
              });
            }
            if (!result.ok && !result.data?.error_code) {
              Toast.show(t("toast error general"), {
                duration: Toast.durations.SHORT,
              });
            }
            if (result.ok) {
              if (result.data?.selected_users)
                authContext.setSelectedUsers(result.data.selected_users);
              // Add a Toast to notify user.
              Toast.show(t("toast contact added successfully"), {
                duration: Toast.durations.LONG,
              });
            }
          }
          Toast.show(t("toast contact added successfully phone"), {
            duration: Toast.durations.LONG,
          });
          authContext.setContactAdded((count) => count + 1);
          //toggleModal();
        })
        .catch((error) => {
          console.log(error.message);
        });
    } else {
      //if user is not added to phone, add it to local contacts
      let contactForLocalContact = {};
      contactForLocalContact.list_id = evacListAlarm.list_id;
      contactForLocalContact.contact_id = androidOrAppleId;
      contactForLocalContact.firstname = firstname;
      contactForLocalContact.lastname = lastname;
      contactForLocalContact.name =
        (firstname ? firstname + " " : "") + (lastname ? lastname : "");
      contactForLocalContact.phoneNumbers = [{ number: phone ? phone : null }];
      //adding contact to selected users done with backend event
      addContactToSelected
        ? (contactForLocalContact.add_to_selected = true)
        : (contactForLocalContact.add_to_selected = false);
      const abortControllerLocalContact = new AbortController();

      const result = await createLocalContactApi.createLocalContact(
        contactForLocalContact,
        { signal: abortControllerLocalContact.signal }
      );
      console.log("local user create API: ", JSON.stringify(result, null, 2));
      if (result.ok) {
        Toast.show(t("local contact created"), {
          duration: Toast.durations.SHORT,
        });
        if (result.data?.local_contacts)
          authContext.setLocalContacts(result.data.local_contacts);
        if (result.data?.selected_users)
          authContext.setSelectedUsers(result.data.selected_users);
        if (result.data?.selected_users_checkins)
          authContext.setSelectedUsersCheckins(
            result.data.selected_users_checkins
          );
        onClose();
      }

      return () => {
        abortControllerLocalContact.abort();
      };
    }
  };

  const inputs = () => [firstnameInputRef, lastnameInputRef, phoneInputRef];

  const editNextInput = () => {
    const activeIndex = getActiveInputIndex();
    if (activeIndex === -1) return;
    const nextIndex = activeIndex + 1;
    if (nextIndex < inputs()?.length && inputs()[nextIndex].current != null) {
      setFocus(inputs()[nextIndex], true);
    } else {
      finishEditing();
    }
  };
  const onInputFocus = () => {
    setActiveIndex(getActiveInputIndex());
  };
  const getActiveInputIndex = () => {
    return inputs().findIndex((input) => input.current?.isFocused());
  };
  const finishEditing = () => {
    const activeIndex = getActiveInputIndex();
    if (activeIndex === -1) return;
    setFocus(inputs()[activeIndex], false);
  };
  const setFocus = (textInputRef, shouldFocus) => {
    if (shouldFocus) {
      setTimeout(() => {
        textInputRef.current.focus();
      }, 100);
    } else {
      textInputRef.current.blur();
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
                name="account-plus-outline"
              />
              <Text style={styles.modalTitle}>{t("add local contact")}</Text>
            </View>
            <View>
              <Pressable style={styles.modalHeaderClose} onPress={onClose}>
                <Text>X</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.modalList}>
            <Formik
              initialValues={{ firstname: "", lastname: "", phone: "" }}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              {({ handleChange, handleSubmit, errors }) => (
                <>
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder firstname")}
                      style={styles.textInput}
                      returnKeyType="next"
                      onSubmitEditing={editNextInput}
                      onFocus={onInputFocus}
                      onChangeText={handleChange("firstname")}
                      ref={firstnameInputRef}
                      placeholderTextColor="#333"
                    />
                    {errors.firstname && (
                      <Text style={styles.error}>{t(errors.firstname)}</Text>
                    )}
                  </View>
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder lastname")}
                      style={styles.textInput}
                      returnKeyType="next"
                      onSubmitEditing={editNextInput}
                      onFocus={onInputFocus}
                      onChangeText={handleChange("lastname")}
                      ref={lastnameInputRef}
                      placeholderTextColor="#333"
                    />
                    {errors.lastname && (
                      <Text style={styles.error}>{t(errors.lastname)}</Text>
                    )}
                  </View>
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder phone")}
                      style={styles.textInput}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit} // Trigger form submission from keyboard
                      onFocus={onInputFocus}
                      onChangeText={handleChange("phone")}
                      ref={phoneInputRef}
                      placeholderTextColor="#333"
                      keyboardType="phone-pad"
                      textContentType="phone"
                      autoCapitalize="none"
                    />
                    {errors.phone && (
                      <Text style={styles.error}>{t(errors.phone)}</Text>
                    )}
                  </View>
                  <View style={styles.checkboxContainer}>
                    <View style={styles.checkbox}>
                      <CheckBox
                        disabled={false}
                        value={addContactToPhone}
                        onValueChange={setAddContactToPhone}
                      />
                    </View>
                    <View style={styles.checkboxText}>
                      <Text>{t("add phone contact")}</Text>
                    </View>
                  </View>
                  <View style={styles.checkboxContainer}>
                    <View style={styles.checkbox}>
                      <CheckBox
                        disabled={false}
                        value={addContactToSelected}
                        onValueChange={setAddContactToSelected}
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
});

export default ModalLocalContact;
