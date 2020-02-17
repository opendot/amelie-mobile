import React from "react";
import { G, Rect, Path } from "react-native-svg";

import theme from "../themes/base-theme";

const width = 12;
/**
 * A line element that connects 2 pages
 * @param {string} direction 
 */
export default function LinkLine( props ){
    // I use the Rect only get the onPress
    // ATTENTION the Rect is shorter than Line, since it doesn't handle the angle, but it's enough
    let invert = props.x1 > props.x2 ? 1 : -1;
    let height = Math.abs(props.y1 - props.y2);
    return (
        <G>
            <Rect
                onPress={props.onPress}
                disabled={false}
                rotate={invert*(90-getAngleDegrees(props))}
                originX={getMediumX(props)} originY={getMediumY(props)}
                fill="darkgray" fillOpacity={0}
                x={getMediumX(props) -width/2} y={props.y1}
                width={width} height={distance(props.y1, props.y2)}
            />
            <Path
                d={`M${props.x1} ${props.y1} C ${props.x1} ${props.y1+0.4*height}, ${props.x2} ${props.y2-0.4*height}, ${props.x2} ${props.y2}`}
                fill="none"
                stroke={theme.brandPrimary}
                strokeWidth="1" 
            />
        </G>
    )
}

function getMediumX( props ){
    return (props.x1+props.x2)/2;
}

function getMediumY( props ){
    return (props.y1+props.y2)/2;
}

function distance(a, b){
    return Math.abs(a-b);
}

function getAngleRadians(props) {
    return Math.atan2( distance(props.y1, props.y2), distance(props.x1, props.x2));
}

function getAngleDegrees(props) {
    return 180*getAngleRadians(props)/Math.PI;
}