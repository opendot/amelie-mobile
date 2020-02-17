import React from "react";
import {View, Platform, StyleSheet} from "react-native";

// component
import I18n from "../../i18n/i18n";

// third party
import { Button, H3, Spinner, Text } from "native-base";

// styles
import theme from "../../themes/base-theme";

const spinnerSize = 200;

/** Screen used when the calibration is ongoing */
export default function CalibrationOngoingView(props) {
    return (
        <View style={styles.main} >
            <Spinner color="white" size={Platform == "ios" ? "large" : spinnerSize} style={styles.spinner}/>

            <H3 style={styles.text} >{I18n.t("eyetrackerCalibration.ongoing").toUpperCase()}</H3>

            <Button block primary style={props.buttonStyle} onPress={props.onStopTrainingPress}>
                <Text uppercase>{I18n.t("eyetrackerCalibration.stop_training")}</Text>
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
    spinner: {
        height: spinnerSize,
    },
});