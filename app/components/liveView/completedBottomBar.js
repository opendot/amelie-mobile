import React from 'react';
import { StyleSheet, Switch } from 'react-native';

// components
import IconExpandableButton from "./iconExpandableButton";

//third party
import { Col, Grid } from "native-base";

export default function CompletedBottomBar(props) {
    return (
        <Grid style={{ borderTopWidth:1, borderColor:"#666", backgroundColor:"transparent"}}>
            <IconExpandableButton iconName={"md-arrow-back"}
                hide={props.hideBack}
                disabled={!props.currsession || props.disableBack}
                onPress={props.sendBackEvent} debounce={true}
            />
            <IconExpandableButton iconName={"ios-notifications"}
                hide={props.hideAlert}
                selectIndex={props.alertNum}
                subButtons={props.SUBBUTTONS.SOUNDS}
                overlayOffsetY={-3}
                onButtonSelected={props.onAlertSelected}
                onPress={props.onAlertPressed} debounce={true}
            />  
            <IconExpandableButton iconName={"ios-bookmark"}
                nameBelow={true}
                disabled={!props.navigation || props.hasAPreferredTree() || !props.currsession}
                hide={props.hideFavourite}
                selectIndex={props.selectedFavouriteIndex}
                subButtons={props.listFavouriteTrees}
                onButtonSelected={props.onFavouriteSelected}
                onPress={props.onFavouritePressed} debounce={true}
                overlayOffsetY={-5}
                hideSelectedButtonText={false}
            />
            <IconExpandableButton iconName={"ios-shuffle"}
                hide={props.hideShuffle}
                onPress={props.shuffle} debounce={true}
                disabled={!props.currsession}
            />
            <IconExpandableButton iconName={"git-commit"}
                hide={props.hideAlign}
                onPress={props.onAlignPressed} debounce={true}
            />
            <EyeTrackerSwitch
                disabled={!props.currsession || !props.displayPage}
                hide={props.hideSwitch}
                onValueChange={props.onSwitchValueChange}
                value={props.isGazeOn}
                />
        </Grid>
    );
}

function EyeTrackerSwitch(props) {
    if( props.hide ) {
        return null;
    }
    else {
        return (
            <Col style={styles.switchContainer}>
                <Switch
                    disabled={props.disabled}
                    onValueChange={props.onValueChange}
                    value={props.value} 
                />
            </Col> 
        );
    }
}

const styles = StyleSheet.create({
    switchContainer: {
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
});