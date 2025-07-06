import React from "react";
import { PermissionsAndroid } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import EvacuationPeopleListScreen from "./EvacuationPeopleListScreen";
import StatusScreen from "./StatusScreen";

const Tab = createBottomTabNavigator();

function MainScreen({ navigation, route }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "status") {
            iconName = focused ? "alarm-light" : "alarm-light-outline";
          } else if (route.name === "people") {
            iconName = focused
              ? "account-supervisor"
              : "account-supervisor-outline";
          }
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#136",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="status"
        component={StatusScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="people"
        component={EvacuationPeopleListScreen}
        options={{ headerShown: false }}
      />
      {/*       <Tab.Screen
        name="nfc"
        component={ManageNFCScreen}
        options={{ headerShown: false }}
      /> */}
    </Tab.Navigator>
  );
}

export default MainScreen;
