import React from "react";
import { View, StyleSheet } from 'react-native'

// styles
import theme from "../themes/base-theme";

/**
 * The number of completed steps
 * @param {int} completed
 * The number of not completed (empty) steps
 * @param {object} notCompleted
 */
export default function StepProgressBar(props){
    // Compute the total step array, used for dynamic render
    let progress = Array(props.completed).fill(1).concat(Array(props.notCompleted).fill(0))
    return (
        <View style={styles.progressBar}>
            { progress.map((step, index) => { return <View key={index} style={[styles.step, {backgroundColor: (step === 1) ? theme.brandGreen : "white"}]} /> }) }
        </View>
    )
}

const styles = StyleSheet.create({
    progressBar: {
        flexDirection: 'row',
        height: 10,
        borderWidth: 0.5,
        borderColor: "black",
        marginTop: 10
    },
    step: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: "black"
    }
});