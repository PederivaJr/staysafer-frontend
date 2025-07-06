import React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import colors from '../config/color';

function RoundButton({title, onPress}) {
    return (
        <TouchableHighlight style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.lightGrey,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        borderColor: colors.darkGrey,
        borderWidth: 2,
        padding: 4,
        width: 48,
        height: 48,
    },
    text: {
        color: colors.darkGrey,
        fontSize: 18,
        fontWeight: 'normal'
    }
})

export default RoundButton;