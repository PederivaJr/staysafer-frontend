import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import { StyleSheet, Image, View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import createCheckinApi from "../api/createCheckin";
import { useTranslation } from "react-i18next";
import { SAFETY_METHODS } from "../config/globals";

const ListItem = forwardRef(
  (
    { contact, renderRightActions, renderLeftActions, closeSwipeable, index },
    prevRef
  ) => {
    const authContext = useContext(AuthContext);
    const swipeRef = useRef(null);
    const { t, i18n } = useTranslation();
    const [evacPointName, setEvacPointName] = useState(null);

    //console.log("checkin contact", JSON.stringify(contact, null, 2));

    /* let evacList = null;
    // get evac list based on event type
    if (authContext.evacuation?.real_event)
      evacList = authContext.evacLists?.find(
        (list) => list.name === "default alarm"
      );
    if (authContext.evacuation?.drill)
      evacList = authContext.evacLists?.find(
        (list) => list.name === "default drill"
      ); */
    // check if contact is safe in a evac point and set his name
    useEffect(() => {
      if (contact && contact.checkins) {
        //get evac point names from any safety method. example: evacPoints = ['A', 'A', 'B']
        const evacPoints = SAFETY_METHODS.map(
          (method) => contact.checkins[method]
        )
          .filter(
            (checkin) => checkin && checkin.active && checkin.evac_point_name
          )
          .map((checkin) => checkin.evac_point_name);
        // create an array with evac point name as key and occurencies as value [{A: 2, B:1}]
        if (evacPoints?.length > 0) {
          const pointCounts = evacPoints.reduce((acc, method) => {
            acc[method] = (acc[method] || 0) + 1;
            return acc;
          }, {});
          // determine the evac point name that has more occurencies among all methods
          const mostFrequentPoint = Object.keys(pointCounts).reduce((a, b) =>
            pointCounts[a] > pointCounts[b] ? a : b
          );
          setEvacPointName(mostFrequentPoint);
        } else {
          setEvacPointName(null);
        }
      }
    }, [contact]);

    const toggleManualCheckin = async () => {
      const absent = contact?.checkins?.absent?.active;
      //console.log("pressed contact, absent is: ", absent)
      if (absent) {
        // Add a Toast to notify user.
        let toast = Toast.show(t("toast cant save absent"), {
          duration: Toast.durations.LONG,
        });
      }
      if (!absent) {
        //call API
        try {
          const abortController = new AbortController();
          contact.checkin_type = "manual";
          contact.checkin_date = new Date();
          (contact.evac_point_id = authContext.markersWithDistance[0]
            ?.evac_point_id
            ? authContext.markersWithDistance[0].evac_point_id
            : null),
            (contact.checkin_status =
              contact?.checkins?.manual?.active === true ? false : true);
          contact.list_id = authContext.evacuation.list_id;
          // call API
          const result = await createCheckinApi.createCheckin(contact, {
            signal: abortController.signal,
          });
          console.log("manual chekin API: ", JSON.stringify(result, null, 2));
          if (result.ok) {
            // get updated checkins
            authContext.setSelectedUsersCheckins(
              result.data.selected_users_checkins
            );
            // Update the local contact object to reflect the latest checkin state
            const updatedContact = {
              ...contact,
              checkins: {
                ...contact.checkins,
                manual: {
                  ...contact.checkins.manual,
                  active: contact.checkin_status,
                  evac_point_id: contact.evac_point_id,
                  evac_point_name: authContext.markersWithDistance[0]?.title
                    ? authContext.markersWithDistance[0].title
                    : null,
                },
              },
            };
            // Update the local state with the updated contact
            setEvacPointName(updatedContact.checkins.manual.evac_point_name);
            // Here we update the contact prop directly to trigger re-render
            contact.checkins = updatedContact.checkins;
          }
        } catch (error) {
          console.log(error);
          let toast = Toast.show(t("toast error general"), {
            duration: Toast.durations.LONG,
          });
        }
        return () => {
          abortController.abort();
        };
      }
    };

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={
          authContext.settings.manual_active && renderLeftActions
        }
        ref={swipeRef}
        onSwipeableOpen={() => {
          if (
            prevRef &&
            typeof prevRef !== "function" &&
            prevRef.current !== null
          ) {
            if (prevRef.current !== swipeRef.current) {
              prevRef.current.close();
            }
          }
          prevRef.current = swipeRef.current;
        }}
      >
        <Pressable onPress={toggleManualCheckin}>
          <View style={styles.container}>
            <View style={styles.leftContainer}>
              <View style={styles.placeholder}>
                {contact?.image?.uri && (
                  <Image
                    style={styles.contactImg}
                    source={{ uri: contact.image.uri }}
                  />
                )}
                {(contact.phone_id || contact.id) && !contact?.image?.uri && (
                  <Image
                    style={styles.phoneImg}
                    source={require("../assets/phone_user.png")}
                  />
                )}
                {contact.temp_id && contact.expires_in?.expire_date && (
                  <Image
                    style={styles.tempImg}
                    source={require("../assets/temp_user.png")}
                  />
                )}
                {(contact.contact_id || contact.temp_id) &&
                  !contact.expires_in?.expire_date && (
                    <Image
                      style={styles.localImg}
                      source={require("../assets/user.jpg")}
                    />
                  )}
                {contact.user_id &&
                  contact.plan?.name &&
                  contact.plan.name.toLowerCase() !== "collaborator" && (
                    <FontAwesome6
                      name="user-tie"
                      size={28}
                      color={colors.grey}
                    />
                  )}
                {contact.user_id &&
                  contact.plan?.name &&
                  contact.plan.name.toLowerCase() == "collaborator" && (
                    <FontAwesome6
                      name="users-rays"
                      size={28}
                      color={colors.grey}
                    />
                  )}
              </View>
            </View>
            <View style={styles.midContainer}>
              <View style={styles.infoContainer}>
                <Text style={styles.title}>
                  {contact.firstname && contact.lastname
                    ? contact.firstname + " " + contact.lastname
                    : contact.name}{" "}
                  {contact.phoneNumbers?.length > 0 ? (
                    <MaterialCommunityIcons name="phone" size={14} />
                  ) : null}
                </Text>
                {evacPointName && (
                  <Text>
                    {t("nfc check tag")}
                    {": "}
                    {evacPointName}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.rightContainer}>
              {contact.checkins.absent.active && (
                <MaterialCommunityIcons
                  style={styles.iconStatus}
                  name="account-cancel-outline"
                  color={"#d77"}
                />
              )}
              {!contact.checkins.absent.active &&
                authContext.settings.manual_active && (
                  <MaterialCommunityIcons
                    style={styles.iconStatus}
                    name="eye-check-outline"
                    color={
                      contact.checkins.manual.active
                        ? colors.green
                        : colors.lightGrey
                    }
                  />
                )}
              {!contact.checkins.absent.active &&
                authContext.settings.gps_active &&
                contact.user_id && (
                  <MaterialCommunityIcons
                    style={styles.iconStatus}
                    name="map-marker-check"
                    color={
                      contact.checkins.gps.active
                        ? colors.green
                        : colors.lightGrey
                    }
                  />
                )}
              {!contact.checkins.absent.active &&
                authContext.settings.nfc_active &&
                contact.user_id && (
                  <MaterialCommunityIcons
                    style={styles.iconStatus}
                    name="nfc"
                    color={
                      contact.checkins.nfc.active
                        ? colors.green
                        : colors.lightGrey
                    }
                  />
                )}
              {/* {!contact.checkins.absent.active &&
                authContext.settings.beacon_active && (
                  <MaterialCommunityIcons
                    style={styles.iconStatus}
                    name="lighthouse"
                    color={
                      contact.checkins.beacon.active
                        ? colors.green
                        : colors.lightGrey
                    }
                  />
                )} */}
              {/* {!isAbsent && authContext.isBadge && <MaterialCommunityIcons style={styles.iconStatus} name="smart-card-outline" color={isBadgeActive ? "#393" : "#ccc"} />} */}
            </View>
          </View>
        </Pressable>
      </Swipeable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  leftContainer: {
    marginRight: 0,
  },
  midContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  rightContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginLeft: 0,
  },
  infoContainer: {
    marginLeft: 0,
  },
  iconStatus: {
    fontSize: 22,
    padding: 0,
  },
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: 30,
    borderColor: colors.grey,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  localImg: {
    width: 24,
    height: 24,
    opacity: 1,
  },
  contactImg: {
    width: 64,
    height: 64,
  },
  phoneImg: {
    width: 32,
    height: 32,
    opacity: 0.5,
  },
  tempImg: {
    width: 40,
    height: 40,
    opacity: 0.7,
  },
  imgName: {
    fontSize: 16,
    color: colors.darkGrey,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },
  title: {
    fontWeight: "bold",
    color: colors.darkGrey,
  },
});

export default ListItem;
