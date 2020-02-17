import React from 'react';
import { View } from 'react-native';

// component
import I18n from '../../i18n/i18n';
import BackgroundLayer from "./backgroundLayer";

// third party
import { H3, Text, Icon } from 'native-base';
import { SwipeRow } from "react-native-swipe-list-view";

// styles
import theme, { baseStyles } from '../../themes/base-theme';
import pageTheme from '../../themes/page-theme';

/** Default height, the same used in baseStyles.listItem */
const itemHeight = 60;

/**  Show the basic informations about a page */
export default function TreeListItem( props ){
    let fontColor = props.selected ? theme.brandInfo : theme.textColor;
    const rightWidth = props.onTreeDuplicatePress ? 2*itemHeight : itemHeight;

    return(
        <SwipeRow closeOnRowPress={true}
            leftOpenValue={itemHeight} rightOpenValue={-rightWidth}
            leftStopValue={itemHeight} rightStopValue={-rightWidth}
            stopLeftSwipe={itemHeight} stopRightSwipe={-rightWidth}
            disableLeftSwipe={props.onTreeRightPress ? false : true}
            disableRightSwipe={props.onTreeLeftPress ? false : true}
            onRowPress={props.onTreePress ? () => {props.onTreePress(props.tree, props.index)} : null}
            >
        
            <BackgroundLayer item={props.tree} index={props.index} height={itemHeight}
                debounceLeft={true} debounceCopy={true} debounceRight={true}
                onLeftButtonPress={props.onTreeLeftPress}
                onCopyButtonPress={props.onTreeDuplicatePress}
                onRightButtonPress={props.onTreeRightPress}
                />

            <View style={[baseStyles.listItem, {height: itemHeight, flexDirection: "row", alignItems: "center", backgroundColor: "white"}]} >
                { props.tree.favourite ? <Icon style={{marginRight: 8, color: "green"}} name={"ios-bookmark"} /> : null}
                <View style={{flex: 1}} >
                    <Text style={{fontSize: 20, color: fontColor }} numberOfLines={1} >{props.tree.name}</Text> 
                    <Text style={{color: fontColor }} numberOfLines={1} >{I18n.t("page.generics")+": "+props.tree.number_of_pages}</Text>
                </View>
            </View>
        
        </SwipeRow>
    );
}