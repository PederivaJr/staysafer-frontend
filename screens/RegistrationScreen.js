import React, { useRef, useState, useContext } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RoundedButton from "../components/RoundedButton";
import { Formik } from "formik";
import * as Yup from "yup";
import colors from "../config/color";
import registerApi from "../api/register";
import Toast from "react-native-root-toast";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import * as globals from "../config/globals";
import { AuthContext } from "../context/AuthContext";

const RegistrationScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const validationSchema = Yup.object().shape({
    firstname: Yup.string()
      .required(t("validation required field"))
      .min(2, t("validation min length"))
      .label(t("first name")),
    lastname: Yup.string()
      .min(2, t("validation min length"))
      .label(t("last name")),
    email: Yup.string()
      .required(t("validation required field"))
      .email(t("validation invalid email"))
      .label(t("email")),
    phone: Yup.string()
      .matches(globals.PHONE_REGEX, t("validation invalid phone"))
      .label(t("Phone number")),
    company: Yup.string()
      .min(2, t("validation min length"))
      .label(t("company")),
    password: Yup.string()
      .required(t("validation required field"))
      .min(6, t("validation min length"))
      .matches(/[a-z]+/, t("validation lowercase character"))
      .matches(/[A-Z]+/, t("validation uppercase character"))
      .matches(/[@$!%*#?&]+/, t("validation special character"))
      .label(t("password")),
    confirm_password: Yup.string()
      .required(t("validation required field"))
      .oneOf([Yup.ref("password"), null], t("validation passwords must match"))
      .label(t("confirm Password")),
  });
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();
  const firstnameInputRef = useRef();
  const lastnameInputRef = useRef();
  const phoneInputRef = useRef();
  const scrollViewRef = useRef();
  const [activeIndex, setActiveIndex] = useState(null);
  const authContext = useContext(AuthContext);

  const inputs = () => [
    firstnameInputRef,
    lastnameInputRef,
    emailInputRef,
    passwordInputRef,
    confirmPasswordInputRef,
  ];

  const editNextInput = () => {
    const activeIndex = getActiveInputIndex();
    if (activeIndex === -1) {
      return;
    }

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
    const activeIndex = inputs().findIndex((input) => {
      if (input.current == null) {
        return false;
      }
      return input.current.isFocused();
    });
    return activeIndex;
  };
  const finishEditing = () => {
    const activeIndex = getActiveInputIndex();
    if (activeIndex === -1) {
      return;
    }
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

  const handleSubmit = async ({
    firstname,
    lastname,
    email,
    phone,
    password,
    confirm_password,
  }) => {
    const data = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone_number: phone,
      password: password,
      confirm_password: confirm_password,
      language: authContext.languageLocale,
    };
    const result = await registerApi.register(data);
    console.log("registration API: ", result);
    if (result.ok) {
      navigation.navigate("login", { registration: "success" });
    }
    if (!result.ok) {
      if (
        result.data?.message?.email &&
        result?.data?.message?.email[0]?.includes("been taken")
      ) {
        // Add a Toast to notify user.
        Toast.show(t("validation email already taken"), {
          duration: Toast.durations.LONG,
        });
      } else {
        // Add a Toast to notify user.
        Toast.show(t("toast error general"), {
          duration: Toast.durations.LONG,
        });
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg3.jpg")}
      style={styles.bgImage}
    >
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
        <View style={styles.inputContainer}>
          <Formik
            initialValues={{
              firstname: "",
              lastname: "",
              email: "",
              password: "",
              confirm_password: "",
            }}
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
                    placeholderTextColor={colors.darkGrey}
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
                    placeholderTextColor={colors.darkGrey}
                  />
                  {errors.lastname && (
                    <Text style={styles.error}>{t(errors.lastname)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder email")}
                    style={styles.textInput}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("email")}
                    ref={emailInputRef}
                    placeholderTextColor={colors.darkGrey}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                  />
                  {errors.email && (
                    <Text style={styles.error}>{t(errors.email)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder phone")}
                    style={styles.textInput}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("phone")}
                    ref={phoneInputRef}
                    placeholderTextColor={colors.darkGrey}
                    autoCapitalize="none"
                  />
                  {errors.phone && (
                    <Text style={styles.error}>{t(errors.phone)}</Text>
                  )}
                </View>

                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder password")}
                    style={styles.textInput}
                    secureTextEntry={true}
                    returnKeyType="next"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("password")}
                    ref={passwordInputRef}
                    placeholderTextColor={colors.darkGrey}
                    textContentType="password"
                    autoCapitalize="none"
                  />
                  {errors.password && (
                    <Text style={styles.error}>{t(errors.password)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    placeholder={t("input placeholder confirm password")}
                    style={styles.textInput}
                    secureTextEntry={true}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit} // Trigger form submission from keyboard
                    onFocus={onInputFocus}
                    onChangeText={handleChange("confirm_password")}
                    ref={confirmPasswordInputRef}
                    placeholderTextColor={colors.darkGrey}
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
                    title={t("register")}
                    style={styles.fullWidth}
                    backgroundColor={colors.darkerGrey}
                    borderColor={colors.darkerGrey}
                    onPress={handleSubmit}
                  />
                </View>
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
    color: colors.darkGrey,
  },
  inputContainer: {
    flex: 0,
    justifyContent: "flex-end",
    marginTop: 64,
  },
  inputTextWrapper: {
    marginBottom: 16,
  },
  textInput: {
    height: 48,
    borderColor: colors.darkGrey,
    borderBottomWidth: 1,
    paddingRight: 30,
    color: colors.darkGrey,
  },
  errorText: {
    color: colors.red,
    fontSize: 10,
  },
  btnContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  bgImage: {
    flex: 1,
  },
  error: {
    color: colors.red,
  },
});

export default RegistrationScreen;
