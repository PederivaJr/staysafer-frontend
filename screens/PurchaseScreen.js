import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import Purchases from "react-native-purchases";
import Constants from "expo-constants";
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from "accordion-collapse-react-native";
import Toast from "react-native-root-toast";
import { AuthContext } from "../context/AuthContext";
import * as Linking from "expo-linking";
import getUserPlanApi from "../api/getUserPlan";
import { useTranslation } from "react-i18next";
import colors from "../config/color";
import { vh } from "react-native-expo-viewport-units";
import getPlansFeaturesApi from "../api/getPlansFeatures";
import RoundedButton from "../components/RoundedButton";
import createFreeTrialApi from "../api/createFreeTrial";
import restorePurchaseApi from "../api/restorePurchase";
import Icon from "../components/Icon";
import OptionMenuPurchase from "../components/OptionMenuPurchase";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import Screen from "../components/Screen";
import { ResourceStore } from "i18next";

const PurchaseScreen = ({ navigation, route }) => {
  const authContext = useContext(AuthContext);
  const [offeringsError, setOfferingsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offeringsList, setOfferingsList] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [plansFeatures, setPlansFeatures] = useState(null);
  const [updatedPlan, setUpdatedPlan] = useState(null);

  const [updatingPlan, setUpdatingPlan] = useState(false);
  const { t, i18n } = useTranslation();

  const handleShowDisclaimer = () => {
    // Toggle the visibility of the disclaimer
    setShowDisclaimer(!showDisclaimer);
  };
  const handleTermsOfServicePress = () => {
    // Navigation logic for Terms of Service
    Linking.openURL("https://www.staysafer.ch/Terms&Policy_en.html");
  };
  // init revenuecat
  useEffect(() => {
    const revenuecatInit = async () => {
      if (Platform.OS == "android") {
        Purchases.configure({
          apiKey: Constants.expoConfig.extra.revenueCat.APIKeys.google,
          appUserID: authContext.user.uuid,
        });
      }
      if (Platform.OS === "ios") {
        Purchases.configure({
          apiKey: Constants.expoConfig.extra.revenueCat.APIKeys.apple,
          appUserID: authContext.user.uuid,
        });
      }
    };
    revenuecatInit();
  }, []);
  // get plan features
  useEffect(() => {
    const fetchPlansFeatures = async () => {
      if (!plansFeatures) {
        const result = await getPlansFeaturesApi.getPlanFeatures();
        //console.log("plan features API: ", JSON.stringify(result, null, 2));
        if (result.ok) {
          setPlansFeatures(result.data);
        }
      }
    };
    fetchPlansFeatures();
  }, []);
  // after API call, update plan info
  useEffect(() => {
    const updatePlan = async () => {
      if (updatedPlan) {
        Toast.show(t("toast purchase successful"), {
          duration: Toast.durations.LONG,
        });
        authContext.setPlan(updatedPlan);
      }
    };
    updatePlan();
  }, [updatedPlan]);
  // create bulleted list for plan features
  const setFeaturesFormat = (offeringTitle) => {
    //setOfferingsApi(offeringTitle)
    if (plansFeatures) {
      const currentPlanFeatures = plansFeatures[offeringTitle];
      if (currentPlanFeatures) {
        const tranlatedPlanFeatures = currentPlanFeatures.map((item) =>
          t(item)
        );
        const bulletedList = tranlatedPlanFeatures
          .map((feature) => `• ${feature}`)
          .join("\n");
        return bulletedList;
      } else {
        return t("no specific features");
      }
    } else {
      return t("no specific features");
    }
  };
  // fetch available subscriptions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const offerings = await Purchases.getOfferings();
        console.log(
          "revenuecat offerings: ",
          JSON.stringify(offerings, null, 2)
        );
        if (!offerings) {
          return false;
        }
        if (offerings && offerings.all) {
          let allAvailablePackages = [];
          const packagesDetails = Object.keys(offerings.all).map((key) => {
            const { monthly, annual, threeMonth } = offerings.all[key];
            // Add packages to allAvailablePackages
            allAvailablePackages = allAvailablePackages.concat(
              offerings.all[key].availablePackages
            );
            return {
              monthlyPrice: monthly?.product?.priceString ?? t("N/A"),
              annualPrice:
                annual?.product?.priceString ??
                threeMonth?.product?.priceString ??
                t("N/A"),
              title: offerings.all[key].identifier,
              description: offerings.all[key].serverDescription,
              availablePackages: offerings.all[key].availablePackages,
            };
          });
          setOfferingsList(packagesDetails);
        }
      } catch (e) {
        console.error("Failed to fetch offerings", e);
        setOfferingsError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  //after purchase is successful, call API to update plan
  const handlePurchase = async (selectedPackage) => {
    setUpdatingPlan(true);
    try {
      const purchase = await Purchases.purchasePackage(selectedPackage);
      console.log("purchase log: ", JSON.stringify(purchase, null, 2));
      if (!purchase) setUpdatingPlan(false);
      //TODO avoid timeout
      if (purchase.customerInfo.entitlements.active) {
        setExpandedCard(null);
        setTimeout(async () => {
          const result = await getUserPlanApi.getUserPlan(authContext.user.id);
          console.log(
            "update plan after purchase API: ",
            JSON.stringify(result, null, 2)
          );
          if (result.ok) {
            setUpdatedPlan(result.data);
          }
          setUpdatingPlan(false);
        }, 400);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // get free trial plan (professional package)
  const handleFreeTrial = async () => {
    try {
      const data = {};
      data.start_date = new Date();
      const result = await createFreeTrialApi.createFreeTrial(data);
      console.log("free trial API: ", result);
      if (result.ok) {
        if (result.data?.plan) {
          setUpdatedPlan(result.data.plan);
          authContext.setPlan(result.data.plan);
        }
        if (result.data?.user) authContext.setUser(result.data.user);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleRestorePurchase = async () => {
    const result = await restorePurchaseApi.restorePurchase();
    console.log("restore purchase API: ", JSON.stringify(result, null, 2));
    if (result.ok && !result.data.plan?.name) {
      Toast.show(t("no purchases restored"), {
        duration: Toast.durations.LONG,
      });
    }
    if (result.ok && result.data.plan?.name) {
      Toast.show(t("purchases restored"), {
        duration: Toast.durations.LONG,
      });
      console.log("restore purchase API result data: ", result.data.plan);
      authContext.setPlan(result.data.plan);
    }
  };
  // handle option menu action
  const handleAction = (action) => {
    if (action === "restore") handleRestorePurchase();
  };

  return (
    <Screen>
      {updatingPlan && (
        <View style={styles.validatingWrapper}>
          <ActivityIndicator
            animating={loading}
            size="large"
            color={colors.brightGreen}
          />
          <Text style={styles.validatingText}>
            {t("confirming purchase, please wait")}
          </Text>
        </View>
      )}
      {loading && (
        <View style={styles.validatingWrapper}>
          <ActivityIndicator
            style={styles.loading}
            animating={updatingPlan}
            size="large"
            color={colors.brightGreen}
          />
        </View>
      )}
      {!loading && !updatingPlan && (
        <ScrollView>
          <View style={styles.iconContainer}>
            <OptionMenuPurchase onSelectAction={handleAction} />
          </View>
          <View style={styles.titleWrapper}>
            <FontAwesome5
              name="money-check-alt"
              size={24}
              color={colors.darkGrey}
            />
            {route.params?.plan_inactive && !updatedPlan ? (
              <Text style={styles.mainTitle}>{t("subscription expired")}</Text>
            ) : (
              <Text style={styles.mainTitle}>{t("choose plan")}</Text>
            )}
          </View>
          {offeringsList?.length == 0 && (
            <View>
              <Text style={styles.errorStore}>
                {t("error retrieving plans from store")}
              </Text>
            </View>
          )}
          {offeringsList?.length > 0 &&
            offeringsList.map((offering, index) => (
              <Collapse
                key={index}
                isExpanded={expandedCard === index}
                onToggle={() => {
                  expandedCard !== index
                    ? setExpandedCard(index)
                    : setExpandedCard(null);
                }}
              >
                <CollapseHeader>
                  <View style={styles.toggleButton}>
                    <Text style={styles.toggleButtonText}>
                      {t(offering.title)}
                    </Text>
                    <Text style={styles.toggleButtonText}>
                      {expandedCard === index ? (
                        <MaterialCommunityIcons size={40} name="chevron-up" />
                      ) : (
                        <MaterialCommunityIcons size={40} name="chevron-down" />
                      )}
                    </Text>
                  </View>
                </CollapseHeader>
                <CollapseBody style={styles.container}>
                  {/* Dynamic content based on the offering */}
                  <View style={styles.headerContainer}>
                    <Text style={styles.description}>
                      {t(offering.description)}
                    </Text>
                  </View>
                  <View style={styles.featureSection}>
                    <Text style={styles.featureTitle}>
                      {t("premium features")} {t(offering.title)}:
                    </Text>
                    <View>
                      <View style={styles.featureList} key={index}>
                        <Text style={styles.feature}>
                          {setFeaturesFormat(offering.title)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View key={offering.title} style={styles.buttonContainer}>
                    {offering.availablePackages.map((packageItem) => {
                      // Determine the type of package and render the button accordingly
                      // TODO add more time periods options from revenuecat
                      let billingFrequency = packageItem.packageType;
                      let timePeriod =
                        billingFrequency === "MONTHLY"
                          ? t("/ month")
                          : billingFrequency === "ANNUAL"
                            ? t("/ year")
                            : billingFrequency === "THREE_MONTH"
                              ? t("/ quarter")
                              : "";

                      return (
                        <TouchableOpacity
                          key={packageItem.identifier}
                          style={styles.buttonPrimary}
                          onPress={() => handlePurchase(packageItem)}
                        >
                          <Text style={styles.buttonPrimaryText}>
                            {packageItem.product.priceString} {timePeriod}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.disclaimerContainer}>
                    <TouchableOpacity
                      onPress={handleShowDisclaimer}
                      style={styles.disclaimerButton}
                    >
                      <Text style={styles.disclaimerText}>
                        {!showDisclaimer ? t("more info") : t("less info")}
                      </Text>
                      <Text style={styles.arrow}>
                        {showDisclaimer ? (
                          <MaterialCommunityIcons size={32} name="chevron-up" />
                        ) : (
                          <MaterialCommunityIcons
                            size={32}
                            name="chevron-down"
                          />
                        )}
                      </Text>
                    </TouchableOpacity>
                    {showDisclaimer && (
                      <View>
                        <Text style={styles.disclaimer}>
                          {t("subscription disclaimer")}
                        </Text>
                        <Text
                          onPress={handleTermsOfServicePress}
                          style={styles.link}
                        >
                          {t("terms of service")}
                        </Text>
                      </View>
                    )}
                  </View>
                </CollapseBody>
              </Collapse>
            ))}
          {authContext.plan?.free_trial_status === "available" && (
            <View style={styles.freeTrialContainer}>
              <View>
                <Text style={styles.purchaseSuccess}>
                  {t("free trial desc")}
                </Text>
              </View>
              <RoundedButton
                title={t("free trial")}
                style={styles.fullWidth}
                onPress={handleFreeTrial}
              />
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.white,
    minHeight: vh(100),
  },
  iconContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
  validatingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  validatingText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorStore: {
    fontSize: 18,
    textAlign: "center",
    color: colors.darkGrey,
    paddingTop: 16,
  },
  loading: {
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  freeTrialContainer: {
    flex: 0,
    alignItems: "center",
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    flexGrow: 1,
  },
  scrollView: {
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  featureSection: {
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  feature: {
    fontSize: 16,
  },
  fullWidth: {
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  buttonPrimary: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brightGreen,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#028468",
    flex: 1,
    marginRight: 10,
  },
  buttonPrimaryText: {
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    color: colors.white,
  },
  disclaimerContainer: {
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  disclaimerText: {
    fontSize: 18,
    color: colors.darkerGrey,
    fontWeight: "600",
    paddingVertical: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: "grey",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  linkContainer: {
    textAlign: "center",
    marginVertical: 8,
    padding: 0,
  },
  link: {
    textAlign: "center",
    fontSize: 14,
    color: colors.darkBlue,
    textDecorationLine: "underline",
    paddingVertical: 4,
  },
  disclaimerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  arrow: {
    fontSize: 18,
    color: colors.darkGrey,
    marginLeft: 10,
  },
  toggleButton: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 5,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  toggleButtonText: {
    color: colors.darkerGrey,
    fontSize: 18,
    fontWeight: "normal",
  },
  mainTitle: {
    color: colors.darkerGrey,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 16,
  },
  featureList: {
    fontSize: 18,
  },
  purchaseSuccess: {
    marginVertical: 16,
    fontSize: 18,
  },
});

export default PurchaseScreen;
