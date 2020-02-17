import React from 'react';
import { View } from 'react-native';

// component
import I18n from '../../i18n/i18n';
import PageItem from "../pageItem";
import BackgroundLayer from "./backgroundLayer";

// third party
import { H3, Text, Icon } from 'native-base';
import { SwipeRow } from "react-native-swipe-list-view";

// actions
import { calculateDefaultCardsPositionWhenUndefined } from "../../utils/pages";

// styles
import theme, { baseStyles } from '../../themes/base-theme';
import pageTheme from '../../themes/page-theme';

/** Default height, the same used in baseStyles.listItem */
const itemHeight = 60;

/**  Show the basic informations about a page */
export default function PageListItem( props ){
    let fontColor = props.selected ? theme.brandInfo : theme.textColor;
    // Map the array into a string
    let tagsString = null;
    props.page.page_tags.forEach( (tag, index) => {
        if( index == 0){ tagsString = tag.tag}
        else { tagsString += `,${tag.tag}`}
    });

    // Cards may not have position and scale defined
    calculateDefaultCardsPositionWhenUndefined(props.page);

    return(
        <SwipeRow closeOnRowPress={true}
            leftOpenValue={itemHeight} rightOpenValue={-itemHeight}
            leftStopValue={itemHeight} rightStopValue={-itemHeight}
            disableLeftSwipe={props.onPageRightPress ? false : true}
            disableRightSwipe={props.onPageLeftPress ? false : true}
            onRowPress={props.onPagePress ? () => {props.onPagePress(props.page, props.index)} : null}
            >
        
            <BackgroundLayer item={props.page} index={props.index} height={itemHeight}
                debounceLeft={true} debounceRight={true}
                onLeftButtonPress={props.onPageLeftPress}
                onRightButtonPress={props.onPageRightPress}
                />

            <View style={[baseStyles.listItem, {height: itemHeight, flexDirection: "row", alignItems: "center", backgroundColor: "white"}]} >
                <View style={{width: (itemHeight-16)*pageTheme.ratio, height: itemHeight-16 }}>
                    <PageItem
                        page={props.page} cards={props.page.cards} scale={(itemHeight-16)/(pageTheme.height)} />
                </View> 
                <View style={{flex: 1, marginLeft: 8}} >
                    <Text style={{fontSize: 20, color: fontColor }} numberOfLines={1} >{props.page.name}</Text> 
                    <Text style={{color: fontColor }} numberOfLines={1} >{I18n.t("tags")+": "+tagsString}</Text>
                </View>
            </View>
        
        </SwipeRow>
    );
}