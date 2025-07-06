import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import colors from "../config/color";
import Screen from "../components/Screen";
import getEventStatsApi from "../api/getEventStats";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COMPARE_DURATIONS } from "../config/globals";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StatisticsScreen = ({ route }) => {
  const { t } = useTranslation();
  // Function to get the latest check-in date for each user
  const getCheckinDurations = (checkins) => {
    // Convert checkins object into an array of checkin entries
    let checkinsArray = Object.entries(checkins).map(([type, details]) => ({
      type,
      ...details,
    }));
    // Filter only active check-ins with a valid duration
    checkinsArray = checkinsArray.filter(
      (checkin) =>
        checkin.type !== "absent" &&
        checkin.active &&
        checkin.duration_in_seconds !== null
    );
    // Return an array of all duration values
    const durations = checkinsArray.map(
      (checkin) => checkin.duration_in_seconds
    );
    return durations;
  };
  // process data for charts
  const processData = (data, staysaferMode) => {
    let presentUsers = 0;
    let absentUsers = 0;
    let manualCount = 0;
    let gpsCount = 0;
    let nfcCount = 0;
    let safeUsers = 0;
    let notSafeUsers = 0;
    let intervals = [5, 10, 15, 20];
    let safeCounts = [0, 0, 0, 0];
    // set empty values for charts if no data is provided
    if (!data)
      return {
        presentAbsentData: [],
        barChartData: { labels: [], datasets: [] },
        safeNotSafeData: [],
        presentUsers: 0,
        nonAbsentContacts: 0,
        safeByTime: { labels: [], datasets: [] },
      };
    // if data are provided, process them
    data.forEach((user) => {
      const checkins = user.checkins;
      if (checkins.absent.active) {
        absentUsers++;
      }
      if (!checkins.absent.active) {
        presentUsers++;
        const checkinMethodsActive =
          (checkins.manual.active ? 1 : 0) +
          (checkins.gps.active ? 1 : 0) +
          (checkins.nfc.active ? 1 : 0) +
          (checkins.beacon.active ? 1 : 0);

        const isSafe =
          staysaferMode && user.user_id
            ? checkinMethodsActive >= 2
            : checkinMethodsActive >= 1;

        if (isSafe) {
          safeUsers++;
          let checkinDurations = getCheckinDurations(checkins);
          // order checkins from first to last
          if (checkinDurations?.length > 0)
            checkinDurations.sort(COMPARE_DURATIONS);
          // for non company users, the first checkin is when they are considered safe
          let checkinToBeSafe =
            checkinDurations?.length > 0 ? checkinDurations[0] : null;
          // for company users, with staysafer mode on, get second checkin to know when user are considered safe
          if (checkinDurations?.length > 1 && staysaferMode && user.user_id)
            checkinToBeSafe = checkinDurations[1];
          if (checkinToBeSafe) {
            const durationInMinutes = checkinToBeSafe / 60; // Convert to minutes
            intervals.forEach((interval, index) => {
              if (durationInMinutes <= interval) {
                safeCounts[index] += 1;
              }
            });
          }
        } else {
          notSafeUsers++;
        }
        if (checkins.manual.active) manualCount++;
        if (checkins.gps.active) gpsCount++;
        if (checkins.nfc.active) nfcCount++;
      }
    });

    const presentAbsentData = [
      {
        name: t("present"),
        population: presentUsers,
        color: colors.darkBlue,
        legendFontColor: colors.darkGrey,
        legendFontSize: 14,
      },
      {
        name: t("absent"),
        population: absentUsers,
        color: colors.lightGrey,
        legendFontColor: colors.darkGrey,
        legendFontSize: 14,
      },
    ];
    const checkinMethodsData = [
      {
        name: t("manual"),
        population: manualCount,
        color: colors.darkBlue,
        legendFontColor: colors.darkGrey,
        legendFontSize: 14,
      },
      {
        name: t("gps"),
        population: gpsCount,
        color: colors.green,
        legendFontColor: colors.darkGrey,
        legendFontSize: 14,
      },
      {
        name: t("nfc"),
        population: nfcCount,
        color: colors.darkYellow,
        legendFontColor: colors.darkGrey,
        legendFontSize: 14,
      },
    ];
    const safeNotSafeData = [
      {
        name: t("safe"),
        population: safeUsers,
        color: colors.darkBlue,
        legendFontColor: colors.darkGrey,
        legendFontSize: 14,
      },
      {
        name: t("not safe"),
        population: notSafeUsers,
        color: colors.lightGrey,
        legendFontColor: colors.darkGrey,
        legendFontSize: 14,
      },
    ];
    const barChartData = {
      labels: [t("manual"), t("gps"), t("nfc")],
      datasets: [
        {
          data: [manualCount, gpsCount, nfcCount],
        },
      ],
    };
    const safeByTime = {
      labels: intervals.map((interval) => `${interval} ${t("min")}`),
      datasets: [
        {
          data: safeCounts,
        },
      ],
    };

    return {
      presentAbsentData,
      barChartData,
      safeNotSafeData,
      presentUsers,
      nonAbsentContacts: presentUsers,
      safeByTime,
    };
  };
  const insets = useSafeAreaInsets();
  const event = route.params?.event || {};
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [staysaferMode, setStaysaferMode] = useState(false);
  const [stats, setStats] = useState(null);

  // get stats from API
  useEffect(() => {
    const getStats = async () => {
      const abortController = new AbortController();
      const result = await getEventStatsApi.getEventStats(event.id, {
        signal: abortController.signal,
      });
      console.log(
        "get event stats API: ",
        JSON.stringify(result.data, null, 2)
      );
      if (result.ok && result.data) {
        setStats(result.data);
        setStaysaferMode(result.data.staysafer_mode);
      }
      setLoading(false);
    };
    getStats();
  }, [event.id]);

  const formatDuration = (hours, minutes, seconds) => {
    const padZero = (num) => (num < 10 ? `0${num}` : num.toString());
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  };

  const {
    presentAbsentData,
    barChartData,
    safeNotSafeData,
    nonAbsentContacts,
    safeByTime,
  } = processData(stats?.checkins, staysaferMode);

  const screenWidth = Dimensions.get("window").width;

  const testData = {
    labels: ["5min", "10min", "15min", "20min"],
    datasets: [
      {
        data: [2, 5, 14, 14],
      },
    ],
  };
  return (
    <Screen>
      {loading && (
        <View style={styles.validatingWrapper}>
          <ActivityIndicator
            style={styles.loading}
            animating={loading}
            size="large"
            color={colors.brightGreen}
          />
        </View>
      )}
      {!loading && stats && (
        <ScrollView
          style={[
            styles.scrollContainer,
            { paddingBottom: insets.bottom + 24 },
          ]}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <View style={styles.container}>
            <Text style={styles.title}>{t("overview")}</Text>
            <View style={styles.general}>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>{t("event id")}:</Text>
                <Text style={styles.overviewRowValue}>
                  {stats.event_id ? stats.event_id : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>{t("started")}:</Text>
                <Text style={styles.overviewRowValue}>
                  {stats.start_date
                    ? stats.start_date.replace(" ", " - ")
                    : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>{t("ended")}:</Text>
                <Text style={styles.overviewRowValue}>
                  {stats.end_date ? stats.end_date.replace(" ", " - ") : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("event duration")}:
                </Text>
                <Text style={styles.overviewRowValue}>
                  {stats.duration
                    ? formatDuration(
                        stats.duration.hours,
                        stats.duration.minutes,
                        stats.duration.seconds
                      )
                    : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>{t("event type")}: </Text>
                <Text style={styles.overviewRowValue}>
                  {stats.event_type === "alarm" ? t("alarm") : t("drill")}{" "}
                  {stats.event_type === "alarm" ? (
                    <MaterialCommunityIcons
                      name="alarm-light-outline"
                      size={14}
                    />
                  ) : (
                    <MaterialCommunityIcons name="test-tube" size={14} />
                  )}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("staysafer mode")}:{" "}
                </Text>
                <Text style={styles.overviewRowValue}>
                  {stats.staysafer_mode ? t("on") : t("off")}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("people involved")}:
                </Text>
                <Text style={styles.overviewRowValue}>
                  {stats.checkins?.length ? stats.checkins.length : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("people present")}:
                </Text>
                <Text style={styles.overviewRowValue}>
                  {presentAbsentData[0]?.population
                    ? presentAbsentData[0].population
                    : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("people absent")}:
                </Text>
                <Text style={styles.overviewRowValue}>
                  {presentAbsentData[1]?.population
                    ? presentAbsentData[1].population
                    : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("fastest save time")}:
                </Text>
                <Text style={styles.overviewRowValue}>
                  {stats.fastest_time
                    ? formatDuration(
                        stats.fastest_time.hours,
                        stats.fastest_time.minutes,
                        stats.fastest_time.seconds
                      )
                    : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("slowest save time")}:
                </Text>
                <Text style={styles.overviewRowValue}>
                  {stats.slowest_time
                    ? formatDuration(
                        stats.slowest_time.hours,
                        stats.slowest_time.minutes,
                        stats.slowest_time.seconds
                      )
                    : "-"}
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewRowLabel}>
                  {t("average save time")}:
                </Text>
                <Text style={styles.overviewRowValue}>
                  {stats.average_time
                    ? formatDuration(
                        stats.average_time.hours,
                        stats.average_time.minutes,
                        stats.average_time.seconds
                      )
                    : "-"}
                </Text>
              </View>
            </View>
            {/* no charts message */}
            {!stats.checkins && (
              <Text style={styles.noUsers}>{t("no charts to show")}</Text>
            )}
            {/* charts */}
            {stats.checkins?.length > 0 && (
              <View style={styles.chartWrapper}>
                <Text style={styles.title}>{t("safety status")}</Text>
                <PieChart
                  data={safeNotSafeData}
                  width={screenWidth}
                  height={240}
                  chartConfig={{
                    backgroundColor: "#f0f0f0",
                    backgroundGradientFrom: "#f0f0f0",
                    backgroundGradientTo: "#f0f0f0",
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[0, 0]}
                  hasLegend={true}
                  absolute
                />
              </View>
            )}
            {stats.checkins?.length > 0 && (
              <View style={styles.chartWrapper}>
                <Text style={styles.title}>{t("check-in methods")}</Text>
                <BarChart
                  data={barChartData}
                  width={screenWidth}
                  height={240}
                  chartConfig={{
                    backgroundColor: "#f0f0f0",
                    backgroundGradientFrom: "#f0f0f0",
                    backgroundGradientTo: "#f0f0f0",
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    barPercentage: 1,
                    decimalPlaces: 2, // This prevents decimal places from showing
                    propsForBackgroundLines: {
                      strokeDasharray: "", // Solid lines
                      strokeWidth: 1, // Line width
                      stroke: "#777", // Line color
                    },
                    propsForVerticalLabels: {
                      fontSize: 12,
                      fill: "#000",
                    },
                    propsForHorizontalLabels: {
                      fontSize: 12,
                      fill: "#000",
                    },
                    style: {
                      borderWidth: 1,
                      borderColor: "#333", // Axis line color
                    },
                  }}
                  fromZero
                  showBarTops={false}
                  withInnerLines={false} // Show inner grid lines
                  withVerticalLines={true} // Show vertical grid lines
                  withHorizontalLines={true} // Show horizontal grid lines
                  yLabelsOffset={10} // Adjusting the y-axis labels offset
                  yAxisMax={nonAbsentContacts}
                  yAxisInterval={1}
                  verticalLabelRotation={0}
                  showValuesOnTopOfBars
                />
              </View>
            )}
            {stats.checkins?.length > 0 && (
              <View style={styles.chartWrapper}>
                <Text style={styles.title}>{t("safe people progression")}</Text>
                <BarChart
                  data={safeByTime}
                  width={screenWidth}
                  height={240}
                  chartConfig={{
                    backgroundColor: "#f0f0f0",
                    backgroundGradientFrom: "#f0f0f0",
                    backgroundGradientTo: "#f0f0f0",
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    barPercentage: 1,
                    decimalPlaces: 0,
                    propsForBackgroundLines: {
                      strokeDasharray: "", // Solid lines
                      strokeWidth: 1, // Line width
                      stroke: "#777", // Line color
                    },
                    propsForVerticalLabels: {
                      fontSize: 12,
                      fill: "#000",
                    },
                    propsForHorizontalLabels: {
                      fontSize: 12,
                      fill: "#000",
                    },
                    style: {
                      borderWidth: 1,
                      borderColor: "#333", // Axis line color
                    },
                  }}
                  fromZero
                  showBarTops={false}
                  showValuesOnTopOfBars
                  withInnerLines={false} // Show inner grid lines
                  withVerticalLines={true} // Show vertical grid lines
                  withHorizontalLines={true} // Show horizontal grid lines
                  yLabelsOffset={10} // Adjusting the y-axis labels offset
                  yAxisInterval={1}
                  verticalLabelRotation={0}
                />
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  validatingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    marginBottom: 20,
  },
  chartWrapper: {
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    borderTopColor: colors.lightGrey,
    borderTopWidth: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 8,
    marginBottom: 8,
    color: colors.darkBlue,
  },
  general: {
    paddingVertical: 8,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  overviewRowLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.darkGrey,
  },
  overviewRowValue: {
    fontSize: 16,
    color: colors.darkGrey,
  },
  noUsers: {
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 56,
    color: colors.grey,
    borderTopColor: colors.lightGrey,
    borderTopWidth: 1,
  },
});

export default StatisticsScreen;
