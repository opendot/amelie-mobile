import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

// third party
import { Icon } from 'native-base';

/** Default height, the same used in baseStyles.listItem */
const itemHeight = 60;

/** 
 * Button used with react-native-swipe-list-view 
 * @param name
 * @param backgroundColor
 * @param onPress
 * @param size width and height of this button
 * @param color icon color
 */
export default function SwipeItemButton( props ){
    if( props.hidden ) { return null; }

    let size = props.size || itemHeight;
    return (
        <TouchableOpacity style={ [styles.swipeButton, { width: size, height: size, backgroundColor: props.backgroundColor}]}
            disabled={props.onPress ? false : true} onPress={props.onPress }>
            <Icon style={props.color ? {color: props.color} : styles.swipeButtonIcon} name={props.name} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    swipeButton: {
        justifyContent: "center",
        alignItems: "center",
    },
    swipeButtonIcon : {
        color: 'white',
    },
});