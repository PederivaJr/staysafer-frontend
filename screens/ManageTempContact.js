import React, { useEffect, useRef, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RoundedButton from "../components/RoundedButton";
import { Formik } from "formik";
import * as Yup from "yup";
import colors from "../config/color";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import * as globals from "../config/globals";
import updateTempContactApi from "../api/updateTempContact";
import Toast from "react-native-root-toast";

const ManageTempContact = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("validation required field"))
      .min(2, t("validation min length"))
      .label(t("name")),
    count: Yup.number().integer().positive().label(t("people")),
    expire: Yup.number().integer().positive().label(t("expires in")),
    phone_number: Yup.string()
      .matches(globals.PHONE_REGEX, t("validation invalid phone"))
      .label(t("phone")),
  });
  const { contact } = route.params;
  const [activeIndex, setActiveIndex] = useState(null);
  const nameInputRef = useRef();
  const countInputRef = useRef();
  const phoneInputRef = useRef();
  const expireInputRef = useRef();
  const authContext = useContext(AuthContext);

  const handleSubmit = async ({ name, count, phone_number, expire }) => {
    Keyboard.dismiss();
    const result = await updateTempContactApi.updateTempContact(
      contact.temp_id,
      name,
      count,
      phone_number ? phone_number : null,
      expire,
      contact.list_id
    );
    console.log("edit temp contact API: ", JSON.stringify(result, null, 2));
    if (result.ok) {
      if (result.data?.temp_contacts)
        authContext.setTempContacts(result.data.temp_contacts);
      Toast.show(t("temp contact updated"), {
        duration: Toast.durations.SHORT,
      });
      if (result.data?.selected_users)
        authContext.setSelectedUsers(result.data.selected_users);
    }
  };
  const inputs = () => [
    nameInputRef,
    countInputRef,
    phoneInputRef,
    expireInputRef,
  ];

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
    <KeyboardAwareScrollView
      style={styles.container}
      contentOffset={{ x: 0, y: 124 }}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingTop: 4, justifyContent: "flex-start" }}
      contentInsetAdjustmentBehavior="always"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      enableOnAndroid={true}
      extraHeight={16}
      extraScrollHeight={Platform.OS == "android" ? 8 : 0}
      enableResetScrollToCoords={false}
    >
      {authContext.user && (
        <View style={styles.inputContainer}>
          <Formik
            initialValues={{
              name: contact.name,
              count: contact.count.toString(),
              phone_number: contact.phoneNumbers[0]?.number,
              expire: contact?.expire?.toString(),
            }}
            enableReinitialize={true}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({ handleChange, handleSubmit, initialValues, errors }) => (
              <>
                <Text style={styles.header}> </Text>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder firstname")}
                    style={styles.textInput}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("name")}
                    ref={nameInputRef}
                    defaultValue={initialValues.name}
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
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("count")}
                    ref={countInputRef}
                    defaultValue={initialValues.count}
                    keyboardType="numeric"
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
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("phone_number")}
                    ref={phoneInputRef}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    defaultValue={initialValues.phone_number}
                  />
                  {errors.phone_number && (
                    <Text style={styles.error}>{t(errors.phone_number)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder expire")}
                    style={styles.textInput}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    onChangeText={handleChange("expire")}
                    ref={expireInputRef}
                    keyboardType="numeric"
                    defaultValue={initialValues.expire}
                  />
                  {errors.expire && (
                    <Text style={styles.error}>{t(errors.expire)}</Text>
                  )}
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
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
    color: "#fffafa",
  },
  header: {
    height: 8,
  },
  inputContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  inputTextWrapper: {
    marginBottom: 16,
  },
  textInput: {
    height: 40,
    borderColor: "#555",
    borderBottomWidth: 1,
    paddingRight: 30,
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: 10,
  },
  btnContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  bgImage: {
    flex: 1,
  },
  error: {
    color: colors.darkRed,
  },
});

export default ManageTempContact;
