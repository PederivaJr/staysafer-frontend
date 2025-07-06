import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo, {useNetInfo} from "@react-native-community/netinfo";
import { MaterialCommunityIcons} from '@expo/vector-icons';
import colors from '../config/color';
import '../config/lang/i18n';
import {useTranslation} from 'react-i18next';

function OfflineNotice(props) {
    const {t, i18n} = useTranslation();
    const netinfo = useNetInfo();
    if ((netinfo.type === "unknown" || netinfo.type === "none") && netinfo.isInternetReachable === false) {
        return (
            <View style={styles.offlineContainer}>
                <MaterialCommunityIcons size={32} style={styles.noInternetIcon} name="web-off"  />
                <Text style={styles.offlineText}>{t('no internet connection')}</Text>
            </View>
        );
    }
    return null;
}

export default OfflineNotice;

const styles = StyleSheet.create({
    offlineContainer: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: colors.lightRed,
        width: '100%',
        marginBottom: 0,
        paddingVertical: 8,
    },
    noInternetIcon: {
        marginRight: 16,
    },
    offlineText: {
        fontSize: 16,
    }
})