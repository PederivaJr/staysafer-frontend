import React from 'react';
import {StyleSheet, View, Text, Pressable} from 'react-native';
import colors from '../config/color';
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

function SystemSetupArrowItem({title, description, ImageComponent, onPress, disabled, subtitle}) {
    
    return (
        <Pressable onPress={disabled ? null : onPress}>
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.leftContainer}> 
                        {ImageComponent}
                        <View style={styles.infoContainer}>
                            {title && 
                            <Text style={!disabled ? styles.title : styles.titleFaded} >{title}</Text>
                            }
                            {subtitle && 
                            <Text style={!disabled ? styles.description : styles.textFaded}>{ subtitle}</Text>
                            }
                            {description && 
                            <Text style={!disabled ? styles.description : styles.textFaded}>{description}</Text>
                            }
                        </View>
                    </View>
                    <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={36}
                        color={disabled ? colors.lightGrey : colors.darkGrey}
                        />
                    </View>
                </View>
            </View>

        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex:0,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        width: '100%'
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.grey,
        flexGrow: 0
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexGrow: 1,
        maxWidth: '85%'
    },
    iconContainer: {
        flexDirection: 'row',
        marginLeft: 8,
        flexGrow: 0
    },
    infoContainer: {
        flexGrow: 0,
        marginLeft:8,
    },
    iconStatus: {
        fontSize: 22,
        padding: 4,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 40,
        marginRight: 20,
    },
    title: {
        fontWeight: 'bold',
    },
    titleFaded: {
        fontWeight: 'normal',
        color: "#ccc",
    },
    textFaded: {
        color: "#bbb",
    },
    link: {
        color: 'dodgerblue',
        paddingVertical: 8
    },
})

export default SystemSetupArrowItem;