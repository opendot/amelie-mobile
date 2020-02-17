import React from 'react';
import { View } from 'react-native';

// component
import I18n from '../../i18n/i18n';
import BackgroundLayer from "./backgroundLayer";
import VideoIcon from "../../utils/videoIcon";

// third party
import { H3, Text, Icon, Thumbnail } from 'native-base';
import { SwipeRow } from "react-native-swipe-list-view";

// styles
import theme, { baseStyles } from '../../themes/base-theme';

/** Default height, the same used in baseStyles.listItem */
const itemHeight = 60;

/**  Show the basic informations about a card */
export default function CardListItem( props ){
    let fontColor = props.selected ? theme.brandInfo : theme.textColor;
    // Map the array into a string
    let tagsString = null;
    props.card.card_tags.forEach( (tag, index) => {
        if( index == 0){ tagsString = tag.tag}
        else { tagsString += `,${tag.tag}`}
    });

    return(
        <SwipeRow closeOnRowPress={true}
            leftOpenValue={itemHeight} rightOpenValue={-itemHeight}
            leftStopValue={itemHeight} rightStopValue={-itemHeight}
            disableLeftSwipe={props.onCardRightPress ? false : true}
            disableRightSwipe={props.onCardLeftPress ? false : true}
            onRowPress={props.onCardPress ? () => {props.onCardPress(props.card, props.index)} : null}
            >
        
            <BackgroundLayer item={props.card} index={props.index} height={itemHeight}
                debounceLeft={true} debounceRight={true}
                onLeftButtonPress={props.onCardLeftPress}
                onRightButtonPress={props.onCardRightPress}
                />

            <View style={[baseStyles.listItem, {flexDirection: "row", alignItems: "center", backgroundColor: "white"}]} >
                <CardThumbnail label={props.card.label} content={props.card.content} />
                <View style={{flex: 1, marginLeft: 6}} >
                    <Text style={{fontSize: 20, color: fontColor }} numberOfLines={1} >{props.card.label}</Text> 
                    <Text style={{color: fontColor }} numberOfLines={1} >{I18n.t("tags")+": "+tagsString}</Text>
                </View>
            </View>
        
        </SwipeRow>
    );
}

/** Show the image of the card, Image or Text */
function CardThumbnail( props ){
    if( !props.content){ return null;}
    if( props.content.type == "Text"){
        if( props.label){
            const size = 56;
            return (
                <View style={{width: size, height: size, justifyContent: "center", alignItems: "center", backgroundColor: "white"}} >
                    <Text 
                        style={{ 
                            color: "black",
                            fontSize: 12, textAlign: "center", textAlignVertical: "center",}}
                        >{props.label}</Text>
                </View>
            );
        }
        else {
            return null;
        }
    }
    else if (props.content.content_thumbnail){
        return (
            <View>
                <Thumbnail square source={{uri: props.content.content_thumbnail}} />
                <VideoIcon type={props.content.type} totalScale={1} cardPadding={0} />
            </View>
        );
    }
    else {
        return null;
    }
}