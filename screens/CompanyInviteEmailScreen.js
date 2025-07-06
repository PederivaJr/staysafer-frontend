import React, { useContext } from "react";
import { StyleSheet, Text, View, TextInput, Keyboard } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import RoundedButton from "../components/RoundedButton";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import { useTranslation } from "react-i18next";
import createCompanyInviteApi from "../api/createCompanyInvite";
import { COMPARE_ID } from "../config/globals";

function CompanyInviteEmailScreen({ route }) {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required(t("validation required field"))
      .email(t("validation invalid email"))
      .label(t("email")),
  });

  const handleSubmit = async ({ email }, { resetForm, setFieldValue }) => {
    Keyboard.dismiss();
    const data = { email: email };
    const result = await createCompanyInviteApi.createCompanyInvite(data);
    console.log("invite mail response: ", JSON.stringify(result, null, 2));
    if (result.ok) {
      Toast.show(t("toast user added to company"), {
        duration: Toast.durations.LONG,
      });
      if (result.data?.invites) {
        const sortedInvites = result.data.invites.sort(COMPARE_ID);
        authContext.setPendingInvites(sortedInvites);
      }
    }
    resetForm();
    setFieldValue("email", ""); // Ensure field is cleared
  };

  return (
    <View style={styles.inputContainer}>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={(values, actions) => {
          handleSubmit(values, actions);
        }}
        validationSchema={validationSchema}
      >
        {({ handleChange, handleSubmit, errors, touched, values }) => (
          <>
            <Text style={styles.header}> </Text>
            <View style={styles.inputTextWrapper}>
              <TextInput
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                icon="email"
                placeholder={t("input placeholder email invite")}
                onChangeText={handleChange("email")}
                value={values.email}
                textContentType="emailAddress"
                placeholderTextColor="#333"
                returnKeyType="done"
                onSubmitEditing={handleSubmit} // Trigger form submission from keyboard
              />
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}
            </View>
            <View style={styles.btnContainer}>
              <RoundedButton
                title={t("send invite")}
                style={styles.fullWidth}
                onPress={handleSubmit}
              />
            </View>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 0,
    justifyContent: "flex-end",
    alignItems: "stretch",
    marginBottom: 60,
    paddingHorizontal: 16,
  },
  error: {
    color: colors.darkRed,
    textAlign: "left",
  },
  fullWidth: {
    width: "100%",
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
  btnContainer: {
    alignItems: "center",
    marginTop: 0,
  },
  header: {
    height: 240,
  },
});

export default CompanyInviteEmailScreen;
