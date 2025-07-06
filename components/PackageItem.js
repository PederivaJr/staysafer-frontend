import React from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import Purchases from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';


const PackageItem = ({ purchasePackage, setIsPurchasing }) => {
  const navigation = useNavigation();
  const onSelection = async () => {
    setIsPurchasing(true);
    try {
      const { purchaserInfo } = await Purchases.purchasePackage(purchasePackage);
      console.log("customer info: ", purchaserInfo)
      if (typeof(purchaserInfo.entitlements.active["Collaborator package"]) !== 'undefined') {
        navigation.goBack();
      }
    } catch (e) {
      if (!e.userCancelled) {
       console.log('Error purchasing package', e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Pressable onPress={onSelection} style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{purchasePackage.product.title}</Text>
      </View>
      <View>
        <Text style={styles.title}>{purchasePackage.product.priceString}</Text>
        <Text style={styles.title}>{purchasePackage.packageType}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      backgroundColor: '#1a1a1a',
      borderBottomWidth: 1,
      borderBottomColor: '#777',
    },
    title: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    terms: {
      color: 'darkgrey',
    },
  });

export default PackageItem;