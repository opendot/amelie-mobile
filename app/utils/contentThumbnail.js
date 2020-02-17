import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

// components
import File from "./File";
import ImageFile from "./ImageFile";
import VideoFile from "./VideoFile";
import {getBase64String} from "./utils"

// third party
import { Icon, Text } from 'native-base';

// styles
import theme from '../themes/base-theme';

const size = 100;

/**
 * Show the thumbnail of a Content, it handles different types of content,
 * like image and video, url and base64.
 * @param {File} imageAsset contains the base64 { mime: string, data: string}
 */
export default function ContentThumbnail( props ){
    if(props.hide) {return null;}
    let hasImage = props.content || props.imageLabel;
    let iconSize = hasImage ? 22 : 28;
    let imageWidth = size;

    // Show the image, use the Thumbnail if exist
    let thumbnail = null;
    if( props.content instanceof ImageFile) {
        thumbnail = props.content.getThumbnail();
    }
    else if( props.content instanceof VideoFile) {
        thumbnail = props.content.getThumbnail() || props.content;
        if( thumbnail.getType() == "video" && thumbnail.getPath() ) {
            // Use the video as thumbnail
            // Videos are not cropped, so they're larger, increase the width of a value of 16/9
            imageWidth = 1.8*size;
        }
    }
    else if( props.content instanceof File) {
        // The content is a text, show only the image label
        thumbnail = null;
    }

    let uri = null;
    if( thumbnail) {
        switch( thumbnail.getType()) {
            case "image":
                if(thumbnail.getBase64Data()) {
                    uri = {uri: getBase64String({mime: thumbnail.getMime(), data: thumbnail.getBase64Data()})};
                }
                else {
                    uri = {uri: thumbnail.getPath() || thumbnail.getUrl()};
                }
                break;
            case "video":
                uri = {uri: thumbnail.getPath};
                break;
        }
    }

    if( hasImage && !props.imageLabel ) {
        return (
            <Image
                style={[styles.imageCommon, {width: imageWidth, resizeMode: "contain"}]}
                source={uri}
            />
        );
    }
    else if( props.imageLabel ){
        return (
            <Text
                style={[styles.imageCommon, styles.imageText]}
            >{props.imageLabel ? props.imageLabel.toUpperCase() : ""}</Text>
        );
    }
    else {
        return (
            <View style={[ styles.imageCommon, styles.imageIcon]}>
                {props.emptyIconName ?
                    <Icon name={props.emptyIconName} />
                : null}
            </View>
        );
    }
}

function getImageUri( imageUri, imageUrl, imageAsset ) {
    if( imageUri ) {
        return {uri: imageUri};
    }
    else if(imageUrl) {
        return {uri: imageUrl};
    }
    else if( imageAsset ) {
        if( imageAsset.mime.startsWith("image") ){
            return {uri: getBase64String(imageAsset)};
        }
        else if( imageAsset.mime.startsWith("video") ){
            // Show the thumbnail
            if(!imageAsset.asset) {
                // Use the file path
                return {uri: imageAsset.path};
            }
            else if( imageAsset.asset.mime.startsWith("image") ){
                return {uri: getBase64String(imageAsset.asset)};
            }
            else if( imageAsset.asset.mime.startsWith("video") ){
                return {uri: imageAsset.asset.path};
            }
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}

const styles = StyleSheet.create({
    
    imageCommon : {
        width: size,
        height: size,
        margin: 8,
    },

    imageText: {
        backgroundColor: "white",
        color: "black",
        textAlign: "center",
        textAlignVertical:"center",
    },

    imageIcon: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: theme.borderWidth,
        borderColor: theme.borderColor,
    },

});