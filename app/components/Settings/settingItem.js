import React from 'react';
import { Text, View, Slider, StyleSheet } from 'react-native';

// styles
import theme from "../../themes/base-theme";


export default function SettingItem(props) {

    return (
        <View style={[styles.mainContainer,props.containerStyle]}>
            <Text style={[styles.settingItemLabel,props.textStyle]}>{props.title}</Text>
            <View style={styles.horizontalContainer}>
                <View style={styles.fullContainer}>
                    <View style={styles.horizontalContainer}>
                        <Text style={[styles.settingItemLabel, styles.leftItem, props.textStyle]}> {props.minValue} </Text>
                        <Text style={[styles.settingItemLabel, styles.rightItem, props.textStyle]}> {props.maxValue} </Text>
                    </View>
                    <Slider
                        maximumTrackTintColor={theme.inverseTextColor}
                        minimumTrackTintColor={theme.inverseTextColor}
                        thumbTintColor={theme.brandPrimary}
                        step={props.step}
                        minimumValue={props.minValue}
                        maximumValue={props.maxValue}
                        /** Render the correct value */
                        value={props.value}
                        /** Update the value, this implies a new call to render function */
                        onValueChange={props.updateValueFunc}
                    />
                </View>
                <View style={styles.valueContainer}>
                    <Text style={[styles.valueText,props.textStyle]}>{props.value}</Text>
                </View >
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        minHeight: 100,
        paddingTop: 20,
    },
    fullContainer: {
        flex: 1
    },
    settingItemLabel: {
        flex: 1,
        color: theme.inverseTextColor,
        fontSize: theme.fontSizeBase,
        marginHorizontal: 15,
    },
    horizontalContainer: {
        flex:1,
        flexDirection:'row',
        justifyContent: 'space-between',
        marginLeft: 15
    },
    valueContainer: {
        width: 80,
        justifyContent:'flex-end'
    },
    valueText: {
        color: theme.brandText,
        fontSize: 28,
        fontWeight:"bold",
        justifyContent: 'center',
        marginLeft: 5
    },
    leftItem: {
        justifyContent: 'flex-start',
        marginHorizontal: 0,
        marginVertical: 0
    },
    rightItem: {
        textAlign: "right",
        justifyContent: 'flex-end',
        marginVertical: 0,
    }
});