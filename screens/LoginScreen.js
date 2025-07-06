import React, { useEffect, useContext, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  ImageBackground,
  View,
  TextInput,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik } from "formik";
import * as Yup from "yup";
import loginApi from "../api/login";
import RoundedButton from "../components/RoundedButton";
import { AuthContext } from "../context/AuthContext";
import storage from "../auth/storage";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

function LoginScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required(t("validation required field"))
      .email(t("validation invalid email"))
      .label(t("email")),
    password: Yup.string()
      .required(t("validation required field"))
      .min(4, t("validation min length"))
      .label(t("password")),
  });
  const authContext = useContext(AuthContext);
  const [loginFailed, setLoginFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const scrollViewRef = useRef();

  const inputs = () => [emailInputRef, passwordInputRef];

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
  const handleSubmit = async ({ email, password }) => {
    const result = await loginApi.login(email, password);
    //console.log("login API: ", JSON.stringify(result, null, 2));

    if (!result.ok) {
      Toast.show(t(result.data?.error_code || "toast error general"), {
        duration: Toast.durations.LONG,
      });
    }
    if (result.ok) {
      setLoginFailed(false);
      authContext.setPlan(result.data.plan);
      authContext.setMarkers(result.data.evac_points);
      authContext.setSelectedUsersCheckins(result.data.selected_users_checkins);
      authContext.setEvacuation(result.data.evacuation);
      authContext.setSettings(result.data.settings);
      authContext.setUser(result.data.user);
      authContext.setEvacLists(result.data.evac_lists);
      await storage.storeUser(result.data.user);
      await storage.storeToken(result.data.token);
      await storage.storeBiometricKey(result.data.user.id);
    }
  };
  // show message after landing from registration
  useEffect(() => {
    if (route?.params?.registration === "success") {
      // Add a Toast to notify user.
      Toast.show(t("toast registration successfull"), {
        duration: Toast.durations.LONG,
      });
    }
  }, []);

  const goToRecoverPassword = () => {
    navigation.navigate("recovery");
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
            initialValues={{ email: "", password: "" }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({ handleChange, handleSubmit, errors }) => (
              <>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    ref={emailInputRef}
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={true}
                    keyboardType="email-address"
                    onSubmitEditing={editNextInput}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("email")}
                    icon="email"
                    placeholder={t("input placeholder email")}
                    textContentType="emailAddress"
                    placeholderTextColor={colors.darkGrey}
                    returnKeyType="next"
                  />
                  {errors.email && (
                    <Text style={styles.error}>{t(errors.email)}</Text>
                  )}
                </View>
                <View style={styles.inputTextWrapper}>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                    onFocus={onInputFocus}
                    onChangeText={handleChange("password")}
                    icon="lock"
                    placeholder={t("input placeholder password")}
                    secureTextEntry={true}
                    textContentType="password"
                    placeholderTextColor={colors.darkGrey}
                    returnKeyType="done"
                  />
                  {errors.password && (
                    <Text style={styles.error}>{t(errors.password)}</Text>
                  )}
                </View>
                {loginFailed && (
                  <Text style={styles.error}> Ops, something went wrong.</Text>
                )}
                <View style={styles.btnContainer}>
                  <RoundedButton
                    title={t("confirm")}
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
        <View>
          <TouchableWithoutFeedback
            onPress={goToRecoverPassword}
            style={styles.recoverPasswordContainer}
          >
            <Text style={styles.recoverPassword}>{t("forgot password")}</Text>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
    color: colors.darkerGrey,
  },
  inputContainer: {
    flex: 0,
    justifyContent: "flex-end",
    alignItems: "stretch",
    marginTop: 240,
  },
  bgImage: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-end",
  },
  error: {
    color: colors.red,
    textAlign: "left",
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: "center",
    marginTop: 24,
    marginBottom: 48,
  },
  fullWidth: {
    width: "100%",
  },
  inputTextWrapper: {
    marginBottom: 16,
  },
  textInput: {
    height: 48,
    borderColor: "#aaa",
    borderBottomWidth: 1,
    paddingRight: 30,
    color: colors.darkGrey,
  },
  btnContainer: {
    alignItems: "center",
    marginTop: 0,
  },
  header: {
    height: 240,
  },
  recoverPasswordContainer: {
    marginTop: 24,
    padding: 8,
  },
  recoverPassword: {
    color: colors.darkGrey,
    textAlign: "center",
  },
});

export default LoginScreen;
