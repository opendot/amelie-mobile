import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';

//third party
import { Icon, Text } from "native-base";


export default function AlertBottomBar(props) {
    return (
        <View style={styles.bottomBarContainer}>
            <BottomBarItem label={1} iconName={props.iconName} onPress={props.onPress} overlayOffsetY={props.overlayOffsetY} />
            <BottomBarItem label={2} iconName={props.iconName} onPress={props.onPress} overlayOffsetY={props.overlayOffsetY} />
            <BottomBarItem label={3} iconName={props.iconName} onPress={props.onPress} overlayOffsetY={props.overlayOffsetY} />
            <BottomBarItem iconName={"git-commit"} onPress={props.onAlignPressed} overlayOffsetY={props.overlayOffsetY} />
            <View style={styles.bottomBarItemContainer}>
                <Switch
                    disabled={!props.currsession || !props.displayPage}
                    onValueChange={props.onSwitchValueChange}
                    value={props.isGazeOn} 
                />
            </View>
        </View>  
    );
}

function BottomBarItem(props) {
    return (
        <TouchableOpacity
            style={styles.bottomBarItemContainer}
            onPress={() => props.onPress(props.label - 1)}
        >
            <Icon style={{color: "white"}} name={props.iconName}/>
                <View style={styles.overlayTextWrapper}>
                    <Text style={[styles.overlayText, {marginTop: props.overlayOffsetY, marginLeft: 1, color: "black"}]}
                        numberOfLines={1} >
                        {props.label}
                    </Text>
                </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    
    bottomBarContainer: {
        flex: 1,
        flexDirection: 'row',
        height: 40,
        paddingHorizontal: "5%",
        borderTopWidth:1,
        borderColor:"#666",
        backgroundColor: "black"
    },
    bottomBarItemContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems:"center"
    },
    overlayTextWrapper: {
        flex: 1,
        position: "absolute",
        paddingRight: (Platform.OS === 'ios') ? 2 : 0,
    },
    overlayText: {
        color: "black",
        fontSize: 12,
        textAlign: "center",
    },
})


/*
<Grid style={{ borderTopWidth:1, borderColor:"#666", backgroundColor:"transparent"}}>
            <IconExpandableButton iconName={"md-arrow-back"}
                disabled={!props.currsession}
                onPress={props.sendBackEvent}
            />
            <IconExpandableButton iconName={"ios-notifications-outline"}
                selectIndex={props.alertNum}
                subButtons={props.SUBBUTTONS.SOUNDS}
                overlayOffsetY={-3}
                onButtonSelected={props.onAlertSelected}
                onPress={props.onAlertPressed}
            />  
            <IconExpandableButton iconName={"ios-bookmark-outline"}
                disabled={!props.navigation || props.hasAPreferredTree() || !props.currsession}
                selectIndex={props.selectedFavouriteIndex}
                subButtons={props.listFavouriteTrees}
                onButtonSelected={props.onFavouriteSelected}
                onPress={props.onFavouritePressed}
                overlayOffsetY={-5}
                hideSelectedButtonText={false}
            />
            <IconExpandableButton iconName={"ios-shuffle"}
                onPress={() => {props.shuffle(); console.log("Press")}}
                disabled={!props.currsession}
            />
            <Col style={{ height: 40, justifyContent: "center", alignItems: "center", backgroundColor: "black"}}>
                <Switch
                    disabled={!props.currsession || !props.displayPage}
                    style={{alignSelf:"center"}}
                    onValueChange={props.onSwitchValueChange}
                    value={props.isGazeOn} />
            </Col> 
        </Grid>
    */