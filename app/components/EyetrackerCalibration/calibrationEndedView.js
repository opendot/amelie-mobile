import React from "react";
import {View, StyleSheet} from "react-native";

// component
import I18n from "../../i18n/i18n";

// third party
import { Button, H3, Icon, Text } from "native-base";

// styles
import theme from "../../themes/base-theme";

const iconSize = 200;

/** Screen used when the calibration is over */
export default function CalibrationEndedView(props) {
    return (
        <View style={styles.main}>

            <Icon name="checkmark" style={styles.confirmCheck} />

            <H3 style={styles.text} >{I18n.t("eyetrackerCalibration.complete").toUpperCase()}</H3>

            <Button block primary style={props.buttonStyle} onPress={props.onBackToMenuPress}>
                <Text uppercase>{I18n.t("back_to_menu")}</Text>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
    },
    text: {
        color: theme.inverseTextColor,
    },
    confirmCheck: {
        color: "white",
        fontSize: iconSize,
    },
});