import React from "react";
import {View, StyleSheet} from 'react-native'

/**
 * The percentage of filling.
 * @param {int} progress
 * The style of the container around the progress bar.
 * @param {object} containerStyle
 * The style of components at the left and at the right of the progress bar
 * @param {object} spacerStyle
 * The style of the background of the progress bar
 * @param {object} backgroundStyle
 * The style of the filled part
 * @param {object} progressStyle
 */
export default function ProgressBar( props ){
    let progress = props.progress==null?50:props.progress;
    return (
        <View style={[styles.container, props.containerStyle]}>
            <View style={[styles.spacer, props.spacersStyle]} />
            <View style={[styles.progressContainer, props.backgroundStyle]}>
                <View style={[styles.progress, props.progressStyle, {flex: progress}]}/>
                <View style={{flex: 100 - progress}} />
            </View>
            <View style={[styles.spacer, props.spacersStyle]} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row'
    },
    spacer: {
        flex: 1,
    },
    progressContainer: {
        height: 4,
        maxHeight: 4,
        flex: 4,
        flexDirection: 'row'
    },
    progress: {
        backgroundColor: '#FAFAFA'
    }
});