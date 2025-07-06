import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, Platform } from "react-native";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import MapManage from "../components/MapManage";
import "react-native-get-random-values";
import RNPickerSelect from "react-native-picker-select";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import * as globals from "../config/globals";

function ManageMapScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const [markerName, setMarkerName] = useState("");
  const [evacPointsLeft, setEvacPointsLeft] = useState(null);
  const [radius, setRadius] = useState(globals.EVAC_POINT_RADII.small);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (authContext.plan.company_max_evac_point == -1) {
      return;
    } else {
      setEvacPointsLeft(
        authContext.plan.company_max_evac_point - authContext.markers?.length
      );
    }
  }, [authContext.markers?.length]);

  /*   const addMarkerToMap = async (e) => {
    const abortController = new AbortController();
    let evacCoordinate = e.nativeEvent.coordinate;
    // check if plan limit has been reached
    if (
      authContext.plan.company_max_evac_point - authContext.markers?.length !=
      0
    ) {
      // if the evac point has no name, alert user
      if (!markerName) {
        // Add a Toast to notify user.
        Toast.show(t("manage map insert a name first"), {
          duration: Toast.durations.SHORT,
        });
      } else {
        // if the name is set, check if the name already exists.
        let alreadyExist = authContext.markers.some(
          (item) => item["title"] == markerName
        );
        if (alreadyExist) {
          // Add a Toast to notify user.
          Toast.show(t("manage map evac point name already exists"), {
            duration: Toast.durations.LONG,
          });
        } else {
          // if the name does not exists, create new marker and save the name
          const newMarker = {
            key: uuidv4(),
            coordinate: evacCoordinate,
            title: markerName,
            description: t("manage map evac point description"),
            radius: radius,
          };
          const result = await createEvacPointsApi.createEvacPoints(newMarker, {
            signal: abortController.signal,
          });
          console.log("add evac point API: ", JSON.stringify(result, null, 2));
          if (result.ok && result.data?.evac_points) {
            authContext.setMarkers(result.data.evac_points);
          }
          //reset marker name input
          setMarkerName("");
        }
      }
    } else {
      // if the limit has been reached, add a Toast to notify user.
      Toast.show(t("manage map evac points limit reached"), {
        duration: Toast.durations.SHORT,
      });
    }
    return () => {
      abortController.abort();
    };
  }; */

  const updateRadius = async (value) => {
    setRadius(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.title}>
          <View>
            <Text style={styles.screenTitle}>{t("manage map title")}</Text>
          </View>
          {!(evacPointsLeft == null) && evacPointsLeft >= 0 && (
            <View style={styles.evacLeft}>
              <Text>
                {authContext.markers?.length}
                {"/"}
                {authContext.plan.company_max_evac_point}
              </Text>
            </View>
          )}
          {authContext.plan.company_max_evac_point == -1 && (
            <View style={styles.evacLeft}>
              <Text style={styles.infinity}>
                {authContext.markers?.length}
                {"/"}&infin;
              </Text>
            </View>
          )}
        </View>
        <View style={styles.mapTextInputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("input placeholder enter evac point name")}
            value={markerName}
            onChangeText={setMarkerName}
          />
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              style={{
                ...pickerSelectStyles,
                iconContainer: {
                  top: 19,
                  right: 9,
                },
              }}
              Icon={() => {
                if (Platform.OS === "ios") {
                  return (
                    <FontAwesome6
                      name="caret-down"
                      size={14}
                      color={colors.darkGrey}
                    />
                  );
                } else null;
              }}
              placeholder={{}}
              value={radius}
              onValueChange={(itemValue) => updateRadius(itemValue)}
              items={[
                { label: t("5m"), value: globals.EVAC_POINT_RADII.small },
                { label: t("10m"), value: globals.EVAC_POINT_RADII.medium },
                { label: t("20m"), value: globals.EVAC_POINT_RADII.large },
                { label: t("50m"), value: globals.EVAC_POINT_RADII.extraLarge },
              ]}
            />
          </View>
        </View>
        <View style={styles.map}>
          <MapManage
            markerName={markerName}
            radius={radius}
            setMarkerName={setMarkerName}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 0,
  },
  map: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: colors.white,
    width: "100%",
    padding: 0,
  },
  mapTextInputContainer: {
    flex: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  evacLeft: {
    borderRadius: 16,
    backgroundColor: colors.lighterGrey,
    marginRight: 0,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  input: {
    flexGrow: 1,
    flexBasis: 1,
    borderColor: colors.darkGrey,
    borderBottomWidth: 1,
    marginRight: 4,
    paddingBottom: 0,
    height: 48,
  },
  title: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  screenTitle: {
    fontSize: 16,
  },
  pickerWrapper: {
    flex: 0,
    flexGrow: 0,
    flexBasis: "33%",

    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  picker: {},
  infinity: {
    fontSize: 18,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12, // Increase vertical padding
    paddingHorizontal: 8,
    borderWidth: 0,
    borderColor: "gray",
    borderRadius: 0,
    color: "black",
    height: 50, // Ensure enough height for text
    lineHeight: 20, // Improve vertical alignment
    textAlignVertical: "center", // Ensures text stays centered
    paddingRight: 30, // Avoid overlap with icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12, // Increase vertical padding
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 0,
    color: "black",
    height: 50, // Match iOS height
    lineHeight: 20, // Improve vertical alignment
    textAlignVertical: "center",
    paddingRight: 30,
  },
});

export default ManageMapScreen;
