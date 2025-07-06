import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { vh } from "react-native-expo-viewport-units";
import { Formik } from "formik";
import * as Yup from "yup";
import RoundedButton from "../components/RoundedButton";
import RoundedTextInput from "../components/RoundedTextInput";
import { AuthContext } from "../context/AuthContext";
import cache from "../utility/cache";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import updateMarkerApi from "../api/updateMarker";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import Screen from "../components/Screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ManageDescriptionScreen({ navigation }) {
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    description: Yup.string()
      .required()
      .min(2, t("validation min length"))
      .label(t("description")),
  });
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const [selectedMarkerId, setSelectedMarkerId] = useState(
    authContext.markers?.length > 0
      ? authContext.markers[0].evac_point_id
      : null
  );

  const selectedMarker = authContext.markers.find(
    (marker) => marker.evac_point_id === selectedMarkerId
  );

  const handleMarkerChange = (id) => {
    setSelectedMarkerId(id);
  };

  const handleSubmit = async ({ description }) => {
    Keyboard.dismiss();
    if (authContext.markers?.length == 0) {
      Toast.show(t("toast no markers"), {
        duration: Toast.durations.LONG,
      });
      return;
    }
    let updatedMarker = authContext.markers.find(
      (marker) => marker.evac_point_id === selectedMarkerId
    );
    updatedMarker.directions = description || null;
    const result = await updateMarkerApi.updateMarker(updatedMarker);
    console.log("update marker API: ", JSON.stringify(result, null, 2));
    if (result.ok) {
      try {
        await cache.store("markers", result.data.evac_points);
        authContext.setMarkers(result.data.evac_points);
      } catch (error) {
        console.log("error setting item to storage");
      }
      Toast.show(t("toast directions set successfully"), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM - insets.bottom,
      });
    }
  };

  const goToManageMap = () => {
    navigation.navigate("evac point");
  };

  let pickerPlaceholder =
    authContext?.markers?.length > 0
      ? t("select evac point")
      : t("no evac points set");

  return (
    <Screen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          enabled
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.title}>
                <Text style={styles.titleText}>
                  {t("manage directions title")}
                </Text>
              </View>
              <View style={styles.pickerWrapper}>
                <View style={styles.pickerIcon}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={24}
                    color={colors.darkGrey}
                  />
                </View>
                <View style={styles.picker}>
                  <RNPickerSelect
                    style={{
                      ...pickerSelectStyles,
                      iconContainer: {
                        top: 19,
                        right: 19,
                      },
                    }}
                    Icon={() => (
                      <FontAwesome6
                        name="caret-down"
                        size={20}
                        color={colors.darkGrey}
                      />
                    )}
                    placeholder={{
                      label: pickerPlaceholder,
                      value: null,
                    }}
                    value={selectedMarkerId}
                    onValueChange={handleMarkerChange}
                    items={authContext.markers.map((marker) => ({
                      key: marker.evac_point_id,
                      label: marker.title,
                      value: marker.evac_point_id,
                    }))}
                  />
                </View>
              </View>
            </View>
            <View>
              <Formik
                key={selectedMarker?.evac_point_id}
                enableReinitialize={true}
                initialValues={{
                  description: selectedMarker?.directions || null,
                }}
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
              >
                {({ handleChange, handleSubmit, errors }) => (
                  <View>
                    <View style={styles.inputContainer}>
                      <RoundedTextInput
                        name="description"
                        multiline={true}
                        numberOfLines={5}
                        autoFocus={false}
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                        onChangeText={handleChange("description")}
                        placeholder={
                          authContext.markers?.length == 0
                            ? t("insert an evac point first")
                            : t("insert description")
                        }
                        defaultValue={
                          selectedMarker?.directions
                            ? selectedMarker.directions
                            : ""
                        }
                        editable={authContext.markers?.length > 0}
                        selectTextOnFocus={authContext.markers?.length > 0}
                        style={styles.textInput}
                      />
                      {errors.description && (
                        <Text style={styles.error}>
                          {t(errors.description)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.submit}>
                      <RoundedButton
                        title={t("confirm")}
                        onPress={handleSubmit}
                        disabled={authContext.markers?.length == 0}
                        backgroundColor={
                          authContext.markers?.length > 0
                            ? colors.darkGrey
                            : colors.lighterGrey
                        }
                        borderColor={
                          authContext.markers?.length > 0
                            ? colors.darkGrey
                            : colors.lightGrey
                        }
                        color={
                          authContext.markers?.length > 0
                            ? null
                            : colors.lightGrey
                        }
                      />
                    </View>
                  </View>
                )}
              </Formik>
            </View>
            <View style={styles.footer}>
              <Pressable onPress={goToManageMap}>
                <View style={styles.linkContainer}>
                  <Text style={styles.link}>{t("add evac point")}</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.lighterGrey,
    paddingBottom: 42,
  },
  content: {
    flex: 0,
    width: "100%",
    marginBottom: 20,
  },
  title: {
    padding: 8,
  },
  titleText: {
    fontSize: 17,
  },
  pickerWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.white,
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  picker: {
    flex: 1,
    paddingLeft: 5,
  },
  pickerIcon: {
    paddingLeft: 10,
    backgroundColor: colors.white,
  },
  inputContainer: {
    padding: 16,
    width: "100%",
  },
  textInput: {
    textAlignVertical: "top",
    minHeight: vh(30),
    width: "100%",
  },
  submit: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footer: {
    borderTopColor: colors.grey,
    borderTopWidth: 1,
    width: "100%",
    marginTop: 20,
  },
  linkContainer: {
    paddingTop: 16,
    marginTop: 10,
  },
  link: {
    fontSize: 16,
    textAlign: "center",
    color: "dodgerblue",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "black",
    height: 60,
    width: "100%",
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "black",
    height: 60,
    width: "100%",
  },
});

export default ManageDescriptionScreen;
