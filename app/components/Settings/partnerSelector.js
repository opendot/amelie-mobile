
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from "native-base";


// styles
import theme from "../../themes/base-theme";

export default function PartnerSelector(props) {
    if( props.hide ) { return null;}
    return(
        <View style={styles.highContainer}>
            <View style={styles.horizontalContainer}>
                <Text style={styles.dividerText}> 
                    {props.currentPatient ? props.currentPatient.name : ""}
                </Text>
                <Text style={styles.dividerText}>
                    {props.currentPatient ? props.currentPatient.surname : ""}
                </Text>
            </View>
            <View style={{flex: 1, alignItems: 'center'}}>
                <Button bordered light disabled={props.disabled}
                        style={{marginVertical: 35}} 
                        onPress={props.changePartner}>
                    <Text style={styles.buttonText}>{props.title}</Text>
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    highContainer: {
        flexDirection: 'row'
    },
    dividerText: {
        color: theme.inverseTextColor,
        fontSize: theme.fontSizeBase,
        marginHorizontal: 15
    },
    horizontalContainer: {
        flex: 1, 
        justifyContent: 'center'
    },
    buttonText: {
        color: "white",
        marginHorizontal: 20,
        fontSize: theme.fontSizeBase
    }
});
