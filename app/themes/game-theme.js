import { StyleSheet } from "react-native";
import baseTheme from "./base-theme";

/**
 * Constants related to games
 */
export const gameStyles = StyleSheet.create({
    label: {
        width: 80,
        marginTop: 4,
        paddingVertical: 2,
        color: baseTheme.inverseTextColor,
        textAlign: "center",
    },
    easy: {
        backgroundColor: baseTheme.brandSuccess,
    },
    medium: {
        backgroundColor: baseTheme.brandWarning,
    },
    hard: {
        backgroundColor: baseTheme.brandDanger,
    },
});