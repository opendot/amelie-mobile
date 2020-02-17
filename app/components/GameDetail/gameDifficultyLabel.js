import React from "react";

// component
import I18n from "../../i18n/i18n";

// third party
import { Text } from "native-base";

// styles
import { gameStyles } from "../../themes/game-theme";

export default function GameDifficultyLabel( props ) {
    return (
        <Text style={[gameStyles.label, gameStyles[props.difficulty]]}>
            {I18n.t(`game.difficulty.${props.difficulty}`)}
        </Text>
    );
}