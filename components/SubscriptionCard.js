import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import {
  Collapse,
  CollapseHeader,
  CollapseBody
} from "accordion-collapse-react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import colors from "../config/color";

function SubscriptionCard({ offering, index, onPress, expandedCard, setExpandedCard, setFeaturesFormat, handleTermsOfServicePress, showDisclaimer}) {
  return (
    <Collapse
              key={index}
              isExpanded={expandedCard === index}
              onToggle={() => {
                expandedCard !== index ? setExpandedCard(index) : setExpandedCard(null)
              }}
            >
              <CollapseHeader>
                <View style={styles.toggleButton}>
                  <Text style={styles.toggleButtonText}>{t(offering.title)}</Text>
                  <Text style={styles.toggleButtonText}>
                  {expandedCard === index ? 
                    <MaterialCommunityIcons size={40} name="chevron-up" /> 
                    :  
                    <MaterialCommunityIcons size={40} name="chevron-down" />
                  }
                  </Text>
                </View>
              </CollapseHeader>
              <CollapseBody style={styles.container}>
                {/* Dynamic content based on the offering */}
                <View style={styles.headerContainer}>
                  <Text style={styles.description}>{t(offering.description)}</Text>
                </View>
                <View style={styles.featureSection}>
                  <Text style={styles.featureTitle}>
                    {t('premium features')} {t(offering.title)}:
                  </Text>
                  <View>
                    <View style={styles.featureList} key={index}>
                      <Text style={styles.feature}>{setFeaturesFormat(offering.title)}</Text>
                    </View>
                  </View>
                </View>
                <View key={offering.title} style={styles.buttonContainer}>
                  {offering.availablePackages.map((packageItem) => {
                    // Determine the type of package and render the button accordingly
                    // TODO add more time periods options from revenuecat
                    let buttonType = packageItem.packageType;
                    let timePeriod =
                      buttonType === "MONTHLY"
                        ? t("/ month")
                        : buttonType === "ANNUAL"
                        ? t("/ year")
                        : t("/ quarter");

                    return (
                      <TouchableOpacity
                        key={packageItem.identifier}
                        style={styles.buttonPrimary}
                        onPress={() => onPress}
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
                    <Text style={styles.arrow}>{showDisclaimer ? 
                      <MaterialCommunityIcons size={32} name="chevron-up" /> 
                      :  
                      <MaterialCommunityIcons size={32} name="chevron-down" />}
                    </Text>
                  </TouchableOpacity>
                  {showDisclaimer && (
                    <View>
                      <Text style={styles.disclaimer}>
                        {t('subscription disclaimer')}
                      </Text>
                      <Text onPress={handleTermsOfServicePress} style={styles.link}>
                        {t('terms of service')}
                      </Text>
                    </View>
                  )}
                </View>
              </CollapseBody>
            </Collapse>
  );
}

const styles = StyleSheet.create({
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
    color: colors.white
  },
  disclaimerContainer: {
    alignItems: "center",
    padding: 20,
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
    textAlign: 'center',
    marginVertical: 8,
    padding: 0
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
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 5,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey
  },
  toggleButtonText: {
    color: colors.darkerGrey,
    fontSize: 18,
    fontWeight: "bold",
  },
  mainTitle: {
    color: "#333",
    textAlign: "center",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8
  },
  featureList: {
    fontSize: 18  
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnContainer: {
    alignItems: "center",
    marginTop: 0,
  },
  purchaseSuccess: {
    marginVertical: 16,
    fontSize: 18
  }
});

export default SubscriptionCard;
