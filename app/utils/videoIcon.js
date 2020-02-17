import React from "react";

// third party
import { Icon } from 'native-base';

/**
 * 
 * @param {string} type 
 * @param {float} totalScale 
 * @param {number} cardPadding 
 */
export default function VideoIcon(props) {
    if(props.type != "Video") {
        return null;
    }
    else {
        const size = 7*props.totalScale;
        return(
            <Icon name={"md-play"}
                style={{position: "absolute", backgroundColor: "white", bottom: 0, right: 0,
                    width: 1.5*size, height: 1.5*size, textAlign: "center",
                    margin: 2*props.cardPadding, padding: 2, fontSize: size}}
                />
        );
    }
}