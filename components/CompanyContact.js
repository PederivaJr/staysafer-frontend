import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import updateUserRoleApi from "../api/updateUserRole";
import OptionMenuManageRoles from "./OptionMenuManageRoles";
import deleteUserFromCompanyApi from "../api/deleteUserFromCompany";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import Toast from "react-native-root-toast";
import { COMPARE_NAMES } from "../config/globals";
import assignManagerToEvacPointApi from "../api/assignManagerToEvacPoint";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";

const CompanyContact = ({ contact }) => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const [showEvacMenu, setShowEvacMenu] = useState(false);
  const [assignedEvacPoint, setAssignedEvacPoint] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authContext.markers) {
      const isAssignedToEvacPoint = authContext.markers.find(
        (point) => point.assigned_to === contact.user_id
      );
      setAssignedEvacPoint(isAssignedToEvacPoint);
    }
  }, [authContext.markers]);

  const handleAssignEvac = async (evacPointId) => {
    if (!evacPointId || processing) return;

    setProcessing(true);
    try {
      const data = { user_id: contact.user_id, evac_point_id: evacPointId };
      const result =
        await assignManagerToEvacPointApi.assignManagerToEvacPoint(data);

      console.log("assign marker API: ", JSON.stringify(result, null, 2));

      if (result.ok) {
        // The real-time hook will update the markers automatically
        // But we can update locally for immediate feedback
        authContext.setMarkers(result.data.evac_points);
        setAssignedEvacPoint(
          result.data.evac_points.find(
            (point) => point.evac_point_id === evacPointId
          )
        );
        Toast.show(t("toast evacuation point assigned"), {
          duration: Toast.durations.SHORT,
        });
      } else {
        Toast.show(t("toast error general"), {
          duration: Toast.durations.SHORT,
        });
      }
    } catch (error) {
      console.error("Assign evacuation point failed:", error);
      Toast.show(t("toast error general"), { duration: Toast.durations.SHORT });
    } finally {
      setProcessing(false);
      setShowEvacMenu(false);
    }
  };

  const revokeAssignEvac = async () => {
    if (!assignedEvacPoint || processing) return;

    setProcessing(true);
    try {
      const data = {
        user_id: null,
        evac_point_id: assignedEvacPoint.evac_point_id,
      };
      const result =
        await assignManagerToEvacPointApi.assignManagerToEvacPoint(data);

      if (result.ok) {
        // The real-time hook will update the markers automatically
        authContext.setMarkers(result.data.evac_points);
        setAssignedEvacPoint(null);
        Toast.show(t("toast evacuation point revoked"), {
          duration: Toast.durations.SHORT,
        });
      } else {
        Toast.show(t("toast error general"), {
          duration: Toast.durations.SHORT,
        });
      }
    } catch (error) {
      console.error("Revoke evacuation point failed:", error);
      Toast.show(t("toast error general"), { duration: Toast.durations.SHORT });
    } finally {
      setProcessing(false);
    }
  };

  const handleAction = async (action) => {
    if (processing) return;
    setProcessing(true);

    try {
      if (
        action &&
        action !== "remove" &&
        action !== "evac" &&
        action !== "revoke"
      ) {
        // Handle role update
        const data = { user_id: contact.user_id, role: action };
        const result = await updateUserRoleApi.updateUserRole(data);

        console.log("update role API: ", JSON.stringify(result, null, 2));

        if (result.ok) {
          // The real-time hook will automatically update the company users
          // No need to manually update authContext here
          console.log("Role updated, real-time update will follow");
          Toast.show(t("toast role updated successfully"), {
            duration: Toast.durations.SHORT,
          });
        } else {
          const errorMessage = result.data?.error_code
            ? t(result.data.error_code)
            : t("toast error general");
          Toast.show(errorMessage, { duration: Toast.durations.SHORT });
        }
      }

      if (action === "remove") {
        const result = await deleteUserFromCompanyApi.removeUserFromCompany(
          contact.user_id
        );

        console.log(
          "remove user from company API:",
          JSON.stringify(result, null, 2)
        );

        if (result.ok) {
          // Update local state immediately for remove action
          authContext.setCompanyUsers(
            result.data.company_users.sort(COMPARE_NAMES)
          );
          authContext.setSelectedUsers(result.data.selected_users);
          Toast.show(t("toast company user removed"), {
            duration: Toast.durations.NORMAL,
          });
          if (result.data.evac_lists)
            authContext.setEvacLists(result.data.evac_lists);
        } else {
          const errorMessage = result.data?.error_code
            ? t(result.data.error_code)
            : t("toast error general");
          Toast.show(errorMessage, { duration: Toast.durations.SHORT });
        }
      }

      if (action === "evac") {
        setShowEvacMenu(true);
      }

      if (action === "revoke") {
        await revokeAssignEvac();
      }
    } catch (error) {
      console.error("Handle action failed:", error);
      Toast.show(t("toast error general"), { duration: Toast.durations.SHORT });
    } finally {
      setProcessing(false);
    }
  };

  const pickerItems =
    authContext.markers?.filter(
      (marker) => marker.evac_point_id !== assignedEvacPoint?.evac_point_id
    ) || [];

  return (
    <View style={styles.container}>
      <View style={styles.contactWrapper}>
        <View style={styles.iconLeft}>
          {contact.plan?.name?.toLowerCase() !== "collaborator" && (
            <FontAwesome6
              name="user-tie"
              size={20}
              color={contact.plan?.active ? colors.darkGreen : colors.darkRed}
            />
          )}
          {contact.plan?.name?.toLowerCase() === "collaborator" && (
            <FontAwesome6
              name="users-rays"
              size={20}
              color={contact.plan?.active ? colors.green : colors.darkRed}
            />
          )}
          {!contact.plan?.name && (
            <FontAwesome6 name="user-lock" size={20} color={colors.grey} />
          )}
        </View>
        <View style={styles.contactData}>
          <Text style={styles.name}>
            {contact.firstname || "no name"} {contact.lastname || ""}{" "}
            {contact.user_id === authContext.user.id ? t("you") : ""}
            {processing && (
              <Text style={styles.processingText}> ({t("updating...")})</Text>
            )}
          </Text>
          <Text style={styles.phoneNumber}>
            {t("role")}: {t(contact.role)}
          </Text>
          {assignedEvacPoint && (
            <Text style={styles.phoneNumber}>
              {t("assigned evacuation point")}: {assignedEvacPoint?.title}
            </Text>
          )}
        </View>
        <View style={styles.selectedIcon}>
          <OptionMenuManageRoles
            availableRoles={[
              "admin",
              "security officer",
              "security supervisor",
              "collaborator",
              "evac",
              "revoke",
              "remove",
            ].filter((role) => role !== contact.role)}
            onSelectAction={handleAction}
            contact={contact}
            disabled={processing}
          />
        </View>
      </View>
      {showEvacMenu && (
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
            placeholder={{
              label: t("select evac point"),
              value: null,
            }}
            value={null}
            onValueChange={(value) => {
              if (value) handleAssignEvac(value);
              setShowEvacMenu(false);
            }}
            items={pickerItems.map((marker) => {
              return {
                label: marker.title,
                value: marker.evac_point_id,
              };
            })}
            disabled={processing}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  contactWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconLeft: {
    padding: 8,
  },
  contactData: {
    flex: 1,
    paddingLeft: 8,
  },
  name: {
    fontSize: 16,
    color: colors.darkGrey,
  },
  phoneNumber: {
    color: colors.grey,
  },
  processingText: {
    color: colors.primary,
    fontStyle: "italic",
    fontSize: 14,
  },
  selectedIcon: {
    padding: 8,
  },
  pickerWrapper: {
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 1,
    marginVertical: 8,
  },
  picker: {
    backgroundColor: colors.lighterGrey,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12, // Increase vertical padding
    paddingHorizontal: 8,
    borderWidth: 0,
    borderColor: colors.grey,
    borderRadius: 8,
    color: colors.black,
    height: 50,
    lineHeight: 20,
    textAlignVertical: "center",
    paddingRight: 30, // Avoid overlap with icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 0,
    borderColor: colors.grey,
    borderRadius: 8,
    color: colors.black,
    height: 50,
    lineHeight: 20,
    textAlignVertical: "center",
    paddingRight: 30,
  },
});

export default CompanyContact;
