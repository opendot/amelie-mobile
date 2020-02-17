import React from 'react';
import { View, StyleSheet } from 'react-native';

// third party
import { Icon, Text } from 'native-base';

export default function ContentOverlayLabel(props) {
    if( !props.content || !props.content.mime) {
        return null;
    }
    else if( props.content.mime.startsWith("image") ) {
        return null;
    }
    else if( props.content.mime.startsWith("audio")
        || props.content.mime.startsWith("video") ) {
        let textStyle = props.fontSize ? [styles.contentLabeltext, {fontSize: props.fontSize}]
            : styles.contentLabeltext;
        return (
            <View style={[styles.contentLabel, props.style || {}]} >
                <Icon style={textStyle} name={getIconNameFromMime(props.content.mime)} />
                {props.content.duration ? 
                    <Text style={textStyle}>{props.content.duration}</Text>
                : null}
            </View>
        );
    }
    else {
        return null;
    }
}

/** Get a valid Icon based on the mime of the file */
function getIconNameFromMime(mime) {
    if( !mime ){
        return null;
    }
    else if( mime.startsWith("audio")) {
        return "md-musical-note";
    }
    else if( mime.startsWith("image")) {
        return "md-image";
    }
    else if( mime.startsWith("video")) {
        return "md-videocam";
    }
}

const styles = StyleSheet.create({
    contentLabel: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 2,
        backgroundColor: "black",
        opacity: 0.84,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    contentLabeltext: {
        color: "white",
        fontSize: 12,
    },
});