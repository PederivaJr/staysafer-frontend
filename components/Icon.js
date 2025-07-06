import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

function Icon({
    name,
    size,
    backgroundColor,
    iconColor,
    border,
    rotate,
    family = 'materiaCommunityIcons'
}) {
    return (
        <View 
            style={{
            width: size,
            height: size,
            borderRadius : size/2,
            backgroundColor: backgroundColor,
            iconColor: iconColor,
            borderColor: border,
            borderWidth: border ? 1 : 0,
            justifyContent: 'center',
            alignItems: 'center',
            transform: rotate ? [{rotateY: '180deg'}] : []
            }}
        >
           {family=='materiaCommunityIcons' && <MaterialCommunityIcons name={name} size={size/2} color={iconColor} />}
           {family=='fontAwesome5' && <FontAwesome5 name={name} size={size/2} color={iconColor} />}
           {family=='fontAwesome6' && <FontAwesome6 name={name} size={size/2} color={iconColor} />}
        </View>
    );
}

export default Icon;