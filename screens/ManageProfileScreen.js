import React, { useEffect, useRef, useState, useContext } from "react";
import { StyleSheet, Text, TextInput, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RoundedButton from "../components/RoundedButton";
import { Formik } from "formik";
import * as Yup from "yup";
import colors from "../config/color";
import updateProfileApi from "../api/updateProfile";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import * as globals from "../config/globals";
import Toast from "react-native-root-toast";

const ManageProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    firstname: Yup.string()
      .required(t("validation required field"))
      .min(2, t("validation min length"))
      .label(t("first name")),
    lastname: Yup.string()
      .nullable()
      .min(2, t("validation min length"))
      .label(t("last name")),
    email: Yup.string()
      .required(t("validation required field"))
      .email(t("validation invalid email"))
      .label(t("email")),
    company: Yup.string().label(t("company")),
    phone_number: Yup.string()
      .nullable()
      .matches(globals.PHONE_REGEX, t("validation invalid phone"))
      .label(t("phone")),
    old_password: Yup.string()
      .min(4, t("validation min length"))
      .label(t("actual password")),
    password: Yup.string().when("old_password", (old_passwordValue) => {
      if (old_passwordValue) {
        return Yup.string()
          .required(t("validation required field"))
          .min(4, t("validation min length"))
          .label(t("new password"));
      } else {
        return Yup.string()
          .min(4, t("validation min length"))
          .label(t("new password"));
      }
    }),
    confirm_password: Yup.string().when("old_password", (old_passwordValue) => {
      if (old_passwordValue) {
        return Yup.string()
          .required(t("validation required field"))
          .oneOf(
            [Yup.ref("password"), null],
            t("validation passwords must match")
          )
          .label(t("confirm new password"));
      } else {
        return Yup.string()
          .oneOf(
            [Yup.ref("password"), null],
            t("validation passwords must match")
          )
          .label(t("confirm new password"));
      }
    }),
  });

  const emailInputRef = useRef();
  const oldPasswordInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();
  const firstnameInputRef = useRef();
  const lastnameInputRef = useRef();
  const companyInputRef = useRef();
  const phoneInputRef = useRef();
  const scrollViewRef = useRef();
  const authContext = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(null);

  const inputs = () => [
    firstnameInputRef,
    lastnameInputRef,
    emailInputRef,
    phoneInputRef,
    companyInputRef,
    oldPasswordInputRef,
    passwordInputRef,
    confirmPasswordInputRef,
  ];

  const handleSubmit = async ({
    firstname,
    lastname,
    email,
    phone_number,
    company,
    old_password,
    password,
    confirm_password,
  }) => {
    const result = await updateProfileApi.updateProfile(
      authContext.user.id,
      firstname,
      lastname,
      email,
      phone_number,
      company,
      old_password,
      password,
      confirm_password
    );
    if (result.ok) {
      if (result.data?.user) authContext.setUser(result.data.user);
      navigation.navigate("profile", { profile_update: "success" });
      Toast.show(t("profile updated"), {
        duration: Toast.durations.LONG,
      });
    }
  };

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
      contentOffset={{ x: 0, y: 24 }}
      ref={scrollViewRef}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingTop: 16, justifyContent: "flex-end" }}
      contentInsetAdjustmentBehavior="always"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      enableOnAndroid={true}
      extraHeight={16}
      extraScrollHeight={Platform.OS == "android" ? 32 : 0}
      enableResetScrollToCoords={false}
    >
      {authContext.user && (
        <View style={styles.inputContainer}>
          <Formik
            initialValues={{
              firstname: authContext.user.firstname,
              lastname: authContext.user.lastname,
              email: authContext.user.email,
              phone_number: authContext.user.phone_number,
              company:
                authContext.user.company?.name !== "no company"
                  ? authContext.user.company?.name
                  : "",
              old_password: "",
              password: "",
              confirm_password: "",
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
                    placeholderTextColor={colors.darkGrey}
                    style={styles.textInput}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("firstname")}
                    ref={firstnameInputRef}
                    defaultValue={initialValues.firstname}
                  />
                  {errors.firstname && (
                    <Text style={styles.error}>{t(errors.firstname)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder lastname")}
                    placeholderTextColor={colors.darkGrey}
                    style={styles.textInput}
                    returnKeyType="next"
                    onFocus={onInputFocus}
                    onSubmitEditing={editNextInput}
                    onChangeText={handleChange("lastname")}
                    ref={lastnameInputRef}
                    defaultValue={initialValues.lastname}
                  />
                  {errors.lastname && (
                    <Text style={styles.error}>{t(errors.lastname)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder email")}
                    placeholderTextColor={colors.darkGrey}
                    style={styles.textInput}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("email")}
                    ref={emailInputRef}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    defaultValue={initialValues.email}
                  />
                  {errors.email && (
                    <Text style={styles.error}>{t(errors.email)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder phone")}
                    placeholderTextColor={colors.darkGrey}
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
                {authContext.user.role == "admin" && (
                  <View style={styles.inputTextWrapper}>
                    <TextInput
                      placeholder={t("input placeholder company")}
                      placeholderTextColor={colors.darkGrey}
                      style={styles.textInput}
                      returnKeyType="next"
                      onSubmitEditing={editNextInput}
                      onFocus={onInputFocus}
                      onChangeText={handleChange("company")}
                      ref={companyInputRef}
                      autoCapitalize="none"
                      defaultValue={initialValues.company}
                    />
                    {errors.company && (
                      <Text style={styles.error}>{t(errors.company)}</Text>
                    )}
                  </View>
                )}
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder old password")}
                    placeholderTextColor={colors.darkGrey}
                    style={styles.textInput}
                    secureTextEntry={true}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("old_password")}
                    ref={oldPasswordInputRef}
                    textContentType="password"
                    autoCapitalize="none"
                  />
                  {errors.old_password && (
                    <Text style={styles.error}>{t(errors.old_password)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder new password")}
                    placeholderTextColor={colors.darkGrey}
                    style={styles.textInput}
                    secureTextEntry={true}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("password")}
                    ref={passwordInputRef}
                    textContentType="password"
                    autoCapitalize="none"
                  />
                  {errors.password && (
                    <Text style={styles.error}>{t(errors.password)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder confirm new password")}
                    placeholderTextColor={colors.darkGrey}
                    style={styles.textInput}
                    secureTextEntry={true}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    onChangeText={handleChange("confirm_password")}
                    ref={confirmPasswordInputRef}
                    textContentType="password"
                    autoCapitalize="none"
                  />
                  {errors.confirm_password && (
                    <Text style={styles.error}>
                      {t(errors.confirm_password)}
                    </Text>
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

export default ManageProfileScreen;
