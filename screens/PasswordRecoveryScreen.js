import React, { useEffect, useContext, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  ImageBackground,
  View,
  TextInput,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik } from "formik";
import * as Yup from "yup";
import forgotPasswordApi from "../api/forgotPassword";
import RoundedTextInput from "../components/RoundedTextInput";
import RoundedButton from "../components/RoundedButton";
import { AuthContext } from "../context/AuthContext";
import storage from "../auth/storage";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
});

function PasswordRecoveryScreen({ route }) {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [recovered, setRecovered] = useState(null);

  const handleSubmit = async ({ email }) => {
    Keyboard.dismiss();
    const result = await forgotPasswordApi.forgotPassword(email);
    console.log("forgot mail response: ", result);
    if (!result.ok) {
      setRecovered(false);
    }
    if (result.ok) {
      Toast.show(t("toast check your email"), {
        duration: Toast.durations.LONG,
      });
      setRecovered(true);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg3.jpg")}
      style={styles.bgImage}
    >
      <View style={styles.inputContainer}>
        <Formik
          initialValues={{ email: "" }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ handleChange, handleSubmit, errors }) => (
            <>
              <View style={styles.inputTextWrapper}>
                <TextInput
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  icon="email"
                  placeholder={t("input placeholder email")}
                  onChangeText={handleChange("email")}
                  textContentType="emailAddress"
                  placeholderTextColor={colors.darkGrey}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit} // Trigger form submission from keyboard
                />
                <Text style={styles.error}>{errors.email}</Text>
              </View>
              <View style={styles.btnContainer}>
                <RoundedButton
                  title={t("header recovery")}
                  style={styles.fullWidth}
                  backgroundColor={colors.darkerGrey}
                  borderColor={colors.darkerGrey}
                  onPress={handleSubmit}
                />
              </View>
              {recovered && (
                <Text style={styles.successMsg}>
                  {t("toast check your email")}
                </Text>
              )}
              {recovered === false && (
                <Text style={styles.successMsg}>
                  {t("toast error general")}
                </Text>
              )}
            </>
          )}
        </Formik>
      </View>
    </ImageBackground>
  );
}

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
    alignItems: "stretch",
    marginBottom: 100,

    paddingHorizontal: 16,
  },
  successMsg: {
    textAlign: "center",
    color: colors.darkGrey,
    marginTop: 8,
    fontSize: 16,
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
    borderColor: colors.darkGrey,
    borderBottomWidth: 1,
    paddingRight: 30,
    color: colors.darkGrey,
  },
  btnContainer: {
    alignItems: "center",
    marginTop: 0,
  },
});

export default PasswordRecoveryScreen;
