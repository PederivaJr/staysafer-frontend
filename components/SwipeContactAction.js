import React from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import colors from '../config/color';

function SwipeContactAction(props) {
    return (
        <TouchableHighlight  style={[styles.swipeContainer, {backgroundColor: props.background}]} onPress={props.onPress} underlayColor='#ccc'>
            <MaterialCommunityIcons style={styles.swipeIcon} name={props.name} />
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    swipeContainer: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightGrey,
        width: 120,  
        borderBottomWidth: 1,
        borderBottomColor: colors.grey,
    },
    swipeIcon: {
        fontSize: 32,
        color: colors.grey
    },
})

export default SwipeContactAction;