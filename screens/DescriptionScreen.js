import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { vh } from "react-native-expo-viewport-units";
import Screen from "../components/Screen";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";
import NoAlarmMessage from "../components/NoAlarmMessage";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome6,
} from "@expo/vector-icons";
import Icon from "../components/Icon";
import RNPickerSelect from "react-native-picker-select";
import NoPlanMessage from "../components/NoPlanMessage";

function DescriptionScreen(props) {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [descriptionArray, setDescriptionArray] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(
    authContext.markersWithDistance?.length > 0
      ? authContext.markersWithDistance[0].evac_point_id
      : authContext.markers?.length > 0
        ? authContext.markers[0].evac_point_id
        : 0
  );

  useEffect(() => {
    console.log(
      "markers distance",
      JSON.stringify(authContext.markersWithDistance, null, 2)
    );
    if (authContext.markersWithDistance?.length > 0) {
      const getClosestMarker = authContext.markersWithDistance?.find(
        (marker) =>
          marker.evac_point_id === selectedMarkerId &&
          authContext.markers?.some(
            (point) => point.evac_point_id === selectedMarkerId
          )
      );
      const markerWithDirections = authContext.markers?.find(
        (point) => point.evac_point_id == getClosestMarker?.evac_point_id
      );
      console.log("markers closest", JSON.stringify(getClosestMarker, null, 2));
      if (markerWithDirections) {
        setDescriptionArray(
          markerWithDirections.directions
            ? markerWithDirections.directions.split("\n")
            : [t("no direction")]
        );
      }
    }
  }, [
    authContext.markersWithDistance,
    authContext.markers,
    selectedMarkerId,
    t,
  ]);

  const handleMarkerChange = (id) => {
    setSelectedMarkerId(id);
    const getMarkerSelected = authContext.markers?.find(
      (marker) => marker.evac_point_id === id
    );
    if (getMarkerSelected) {
      setDescriptionArray(
        getMarkerSelected.directions
          ? getMarkerSelected.directions.split("\n")
          : [t("no directions")]
      );
    }
  };

  let pickerPlaceholder =
    authContext?.markers?.length > 0
      ? t("select evac point")
      : t("no evac points set");

  return (
    <Screen>
      <View style={styles.container}>
        <Header />
        {!authContext?.plan?.active && <NoPlanMessage />}
        {authContext.plan.active && !authContext.evacuation.evacuation_id && (
          <NoAlarmMessage />
        )}
        {authContext.plan.active && authContext.evacuation.evacuation_id && (
          <View style={styles.listContainer}>
            <View style={styles.pickerWrapper}>
              <View style={styles.pickerIcon}>
                <FontAwesome5 name="map-marker-alt" size={24} />
              </View>
              <View style={styles.picker}>
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
                  placeholder={{ label: pickerPlaceholder, value: null }}
                  value={selectedMarkerId}
                  onValueChange={handleMarkerChange}
                  items={authContext.markers.map((marker, index) => {
                    return {
                      key: index,
                      label: marker.title,
                      value: marker.evac_point_id,
                    };
                  })}
                />
              </View>
            </View>
            {descriptionArray?.length > 0 && (
              <View style={styles.directions} nestedScrollEnabled={true}>
                <FlatList
                  nestedScrollEnabled={true}
                  style={{ width: "100%" }}
                  data={descriptionArray}
                  extraData={descriptionArray}
                  /* keyExtractor={(item, index) =>index.toString()} */
                  renderItem={({ item }) => (
                    <TouchableWithoutFeedback>
                      <View style={styles.directionContainer}>
                        <Text style={styles.directionsList}>{item}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  directionContainer: {},
  pickerContainer: {
    flexGrow: 1,
  },
  directions: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 120,
  },
  directionsList: {
    width: "100%",
    textAlign: "center",
    padding: 8,
    fontSize: 22,
    borderBottomColor: colors.grey,
    borderBottomWidth: 1,
  },
  pickerWrapper: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: colors.grey,
    borderBottomWidth: 1,
    borderTopColor: colors.grey,
    borderTopWidth: 1,
  },
  picker: {
    flexGrow: 1,
    height: 48,
  },
  pickerIcon: {
    paddingLeft: 20,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
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

export default DescriptionScreen;
