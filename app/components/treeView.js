import React from 'react';
import {
    View, TouchableWithoutFeedback, Text, StyleSheet, PanResponder
} from 'react-native';

// components
import I18n from '../i18n/i18n';

// third party
import {Svg, G } from "react-native-svg";

// styles
import { baseStyles } from "../themes/base-theme";
import pageTheme from "../themes/page-theme";

// Constants
const levelHeight = 130;
const pageHeight = pageTheme.height;
const pageWidth = pageTheme.width;
const pageMargin = 10;
const maxCards = pageTheme.maxCards;
const MAX_SCALE = 4;
const MIN_SCALE = 0.05;

/**
 * Visualize data with a Tree Structure
 * It use react-native-svg to draw the elements, it handle scaling and panning
 * @param {array} list complete list of elements to show
 */
export default class TreeView extends React.Component {

    constructor( props){
        super(props);

        let coords = calculateCoords( this.props.list, 1.0);

        this.state = {
            scale: 1.0,
            tempScale: 1.0,
            offsetX: 0,
            offsetY: 0,
            tempOffsetX: 0,
            tempOffsetY: 0,
            listObjWithCoords: coords.listObjWithCoords,
            maxX: coords.maxX,
            maxY: coords.maxY,
        };

        // Used for scaling
        this.pinchStartDistance = 0;
        this.pinchStartX = 0;
        this.pinchStartY = 0;
    }

    componentWillMount() {
        this._initPanResponder();
    }

    componentWillReceiveProps(nextProps){
        // Recalculate coordinates if the list change
        let nextL = nextProps.list;
        let prevL = this.props.list;
        if( nextL.lenght != prevL.length
            || nextL.filter( (item, index) => { return item != prexL[index];} ).length > 0){
            // The list has been updated, recalculate coords
            let coords = calculateCoords( nextL, this.state.scale*this.state.tempScale);
            this.setState({
                listObjWithCoords: coords.listObjWithCoords,
                maxX: coords.maxX,
                maxY: coords.maxY,
            });
        } 
    }

    componentWillUpdate(nextProps, nextState){
        // Recalculate coordinates if the scale change
        if( nextState.tempScale != this.state.tempScale
            || nextState.scale != this.state.scale){
            // The scale changed, recalculate the coords
            let coords = calculateCoords( this.props.list, nextState.scale*nextState.tempScale);
            this.setState({
                listObjWithCoords: coords.listObjWithCoords,
                maxX: coords.maxX,
                maxY: coords.maxY,
            });
        }
    }

    /** Initialize PanResponder, the object that retrieve the Gestures */
    _initPanResponder = () => {
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (event, gestureState) => {
                return (gestureState.numberActiveTouches == 1 || gestureState.numberActiveTouches == 2)
                    && (gestureState.dx*gestureState.dx + gestureState.dy*gestureState.dy > 400);
            },
            onPanResponderMove: (event, gestureState) => {
                const { dx, dy, vx, vy } =gestureState;
                switch( gestureState.numberActiveTouches ){
                    case 1:
                        // Move
                        if( this.state.tempScale != 1) {
                            // A scaling is occuring, probably one finger was released before the other
                            // no movement should be done
                            break;
                        }
                        if( Math.abs(vx*vx +vy*vy) > 0.1*0.1){
                            // Prevent user from moving too far from tree
                            let limitX = this.state.maxX +pageWidth*this.state.scale;
                            let limitY = this.state.maxY +pageHeight*this.state.scale;

                            if( this.state.offsetX + dx < limitX
                                && this.state.offsetX + dx > -limitX) {
                                this.setState({tempOffsetX: dx});
                            }
                            if( this.state.offsetY + dy < limitY
                                && this.state.offsetY + dy > -limitY) {
                                this.setState({tempOffsetY: dy});
                            }
                        }
                        break;
                    case 2:
                        // Scale
                        if( Math.abs(vy) >= 0.001){
                            let tt = event.nativeEvent.touches;
                            let dPinchX = tt[1].locationX - tt[0].locationX;
                            let dPinchY = tt[1].locationY - tt[0].locationY;
                            let distance = Math.sqrt( dPinchX*dPinchX + dPinchY*dPinchY);
                            if( this.pinchStartDistance <= 0){
                                // Start of the pinch, set the distance
                                this.pinchStartDistance = distance;
                            }
                            let maxTempScale = MAX_SCALE/this.state.scale;
                            let minTempScale = MIN_SCALE/this.state.scale

                            let s = distance/this.pinchStartDistance;
                            const newTempScale = Math.min( Math.max(s, minTempScale), maxTempScale);

                            // Move based on scale
                            const centerPinchX = Math.min(tt[0].locationX, tt[1].locationX) + Math.abs(dPinchX)/2;
                            const centerPinchY = Math.min(tt[0].locationY, tt[1].locationY) + Math.abs(dPinchY)/2;

                            if( this.pinchStartX <= 0 && this.pinchStartY <= 0){
                                // Start of the pinch, set the coordinates
                                this.pinchStartX = centerPinchX;
                                this.pinchStartY = centerPinchY;
                            }

                            // Position of the pinch before the scale
                            // const pinchGridPosX = this.pinchStartX * this.state.scale * 1 + ( this.state.offsetX + 0 );
                            // Position of the pinch after the scale
                            // gridPosX = centerPinchX * this.state.scale * newTempScale + ( this.state.offsetX + newTempX );
                            // Must stay the same
                            // pinchGridPosX = gridPosX
                            // centerPinchX * this.state.scale * this.state.tempScale + ( this.state.offsetX + this.state.tempOffsetX ) - centerPinchX * this.state.scale * newTempScale = ( this.state.offsetX + newTempX )
                            // centerPinchX * this.state.scale * this.state.tempScale + ( this.state.offsetX + this.state.tempOffsetX ) - centerPinchX * this.state.scale * newTempScale - this.state.offsetX = newTempX
                            // centerPinchX * this.state.scale * ( this.state.tempScale - newTempScale) + ( this.state.offsetX + this.state.tempOffsetX ) - this.state.offsetX = newTempX
                            // centerPinchX * this.state.scale * ( this.state.tempScale - newTempScale) + ( this.state.offsetX + this.state.tempOffsetX ) - this.state.offsetX = newTempX

                            // Scale not included in the offset
                            // the previous temp scale is always 1, and the previous temp offset is always 0
                            // somehow, this works better when this.state.scale = 1
                            const newTempX = this.pinchStartX * 1 * ( 1 - newTempScale);
                            const newTempY = this.pinchStartY * 1 * ( 1 - newTempScale);

                            // I don't check the limits of the offset, the limit on the scale should be enough
                            this.setState({tempScale: newTempScale, tempOffsetX: newTempX, tempOffsetY: newTempY});
                        }
                        break;
                }
            },
            onPanResponderRelease: (e, gestureState) => {
                // Apply the transformations and reset the values
                // Don't call setState if nothing changed
                if( this.state.tempScale != 1.0){
                    // WARNING possible error: [OpenGLRenderer: Bitmap too large to be uploaded into a texture (3491x6524, max=4096x4096)]
                    const appliedScale = this.state.tempScale;
                    this.setState({scale:  Math.min( Math.max(this.state.scale*this.state.tempScale, MIN_SCALE), MAX_SCALE), tempScale: 1.0});

                    // By changing the scale, the limitX and limitY may become lower than offsetX and offsetY,
                    // thus blocking any movement
                    if( appliedScale < 1){
                        // Reduce the offset based on the new scale value
                        this.setState({offsetX: this.state.offsetX*appliedScale, offsetY: this.state.offsetY*appliedScale,});
                    }
                }
                if( this.state.tempOffsetX != 0){
                    this.setState({offsetX: this.state.offsetX+this.state.tempOffsetX, tempOffsetX: 0});
                }
                if( this.state.tempOffsetY != 0){
                    this.setState({offsetY: this.state.offsetY+this.state.tempOffsetY, tempOffsetY: 0});
                }
                this.pinchStartDistance = 0;
                this.pinchStartX = 0;
                this.pinchStartY = 0;
            }
        });
    }
    

    render() {
        if( !this.props.list || this.props.list.length == 0){
            return <Text style={styles.layerContainer}>{I18n.t("empty_list")}</Text>;
        }
        let scale = this.state.scale*this.state.tempScale;
        let {listObjWithCoords, maxX, maxY} = this.state;
        const marginForCardButton = (pageHeight+ 64)*scale; // cardMaxYPosition + lineHeight = 15 + iconSiz = 40 + margin=2*4 => pageHeight + 63
        const baseWidth  = maxX+pageWidth*scale; // ((maxX+pageWidth)*scale);  // Width of the full tree
        const baseHeight = ((maxY+pageHeight*scale) +marginForCardButton); // ((maxY+pageHeight) +marginForCardButton)*scale; // Height of the full tree
        return (
            <TouchHandlerContainer panResponder={this._panResponder}
                onPress={this.props.onPress}
                offsetX={this.state.offsetX} offsetY={this.state.offsetY}
                tempOffsetX={this.state.tempOffsetX} tempOffsetY={this.state.tempOffsetY}
                baseWidth={baseWidth} baseHeight={baseHeight}
                >
                <LayerItems 
                    listObj={listObjWithCoords}
                    scale={scale}
                    renderItem={this.props.renderItem} />
                <LayerLines 
                    listObj={listObjWithCoords}
                    scale={scale}
                    renderLine={this.props.renderLine}/>
            </TouchHandlerContainer>
        );
    }
}

/** Show the tree in a container that allow to scale/translate the tree */
class TouchHandlerContainer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            contentWidth: -1,
            contentHeight: -1,
        }
    }

    /** Measure width and height of the Content component to fit the container */
    onContentLayout = (evt) => {
        this.setState({
            // contentX: evt.nativeEvent.layout.x,
            // contentY: evt.nativeEvent.layout.y,
            contentWidth: evt.nativeEvent.layout.width,
            contentHeight: evt.nativeEvent.layout.height,
        });
    }

    /**
     * The function that we want are:
     *  - translate with dragging
     *  - scale with pinch
     *  - respond to click
     * This must happen by clicking anything on the screen
     * 
     * The structure is
     * 1. View: contains the panResponder, which handle the touches and apply translation and scaling
     * 2. TouchableWithoutFeedback: handle the click on the screen
     * 3. View: By receiving the dimensions of the first View, it allows to click on the whole screen.
     *          Somehow, even if the clicked are handled on the first view, they're only seen on the surface of this View
     * 4. View: with position absolute, it applies the transformations to the tree
     */
    render() {
        return (
            <View style={baseStyles.fullPage} {...this.props.panResponder.panHandlers}
                onLayout={this.onContentLayout}>
                <TouchableWithoutFeedback onPress={this.props.onPress} >
                    <View style={{flex: 1, overflow: "hidden", width: this.state.contentWidth, height: this.state.contentHeight}}>
                        <View style={{
                            position: "absolute", left: this.props.offsetX+this.props.tempOffsetX, top: this.props.offsetY+this.props.tempOffsetY,
                            width: this.props.baseWidth, height: this.props.baseHeight,
                        }}>
                            {this.props.children} 
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

/**
 * The component that draws all the lines between the items
 * @param {any} listObj json holding all the elements to show, every element containing the values xPos and yPos
 */
function LayerLines( props ){
    let links = [];

    // Check every item
    Object.values(props.listObj).forEach( (item, iItem) => {
        
        // Draw a link from a card of this page to another page
        item.cards.forEach( (card, indexCard) => {
            if( card.hasOwnProperty("next_page_id")){
                let originCard = card;
                let destPage = props.listObj[card.next_page_id];
                // console.log("LayerLines draw from card to page", originCard, destPage);
                if( !originCard || !destPage ){ return; }

                // Cards have their own scale and position
                let cardX = item.xPos + originCard.x_pos* pageWidth*props.scale +pageTheme.cardBaseWidth*originCard.scale*props.scale/2;
                let cardY = item.yPos + originCard.y_pos* pageHeight*props.scale + pageTheme.cardBaseHeight*originCard.scale*props.scale;

                links.push(props.renderLine( item, originCard, cardX, cardY, destPage, destPage.xPos +pageWidth*props.scale/2, destPage.yPos));
            }
        });
        
    });
    /* Use a View with pointerEvents="none" to ignore all touches. The view must have a width and height, I choose some values big enough */
    return (
        <View pointerEvents="none" style={{flex: 1}}>
            <Svg style={[{flex: 1, alignSelf: 'stretch'}]}>
                <G fill='none' >
                    {links}
                </G>
            </Svg>
        </View>
    );
}

/**
 * The component that draws all the items in the right position
 * @param {any} listObj json holding all the elements to show, every element containing the values xPos and yPos
 */
function LayerItems( props ){
    if( !props.listObj || Object.keys(props.listObj).length == 0){
        return <Text style={styles.layerContainer}>{I18n.t("empty_list")}</Text>;
    }
    
    return (
        <View style={styles.layerContainer}>
            {Object.values(props.listObj).map( (item, index) => {
                return props.renderItem( item, index, item.xPos, item.yPos, props.scale);
            })}
        </View>
    );
}

/**
 * Given a list of items calculate all their coordinates.
 * The coordinates origin is at the topLeft corner of the page
 * @param {array} list 
 * @return a json object, holding every element of the list using its id as key and max positions on x and y.
 *      The object with all the elements allow to easily retrieve an item by using his id
 */
function calculateCoords( list, scale = 1.0, offsetX = 0, offsetY=0 ) {
    const maxLevel = list.reduce((max, item) => item.level > max ? item.level : max, 0);
    
    let listObj = {};
    let maxX = 0, maxY = 0;
    let countPagesOnMaxXLevel = null;
    // Calculate th coordinates of every item
    for(let currentLevel = 0; currentLevel <= maxLevel; currentLevel++){
        let filtrByLvl = list.filter(function(item){return item.level == currentLevel});

        filtrByLvl.forEach( (item, index) => {
            let xPos = offsetX +scale*( index*(pageWidth+pageMargin) -filtrByLvl.length*(pageWidth+pageMargin)/2 );
            let yPos = offsetY +scale*((currentLevel+1 -0.5)*levelHeight);
            if( xPos > maxX){maxX = xPos;countPagesOnMaxXLevel = filtrByLvl.length}
            if( yPos > maxY){maxY = yPos;}
            item.xPos = (xPos);
            item.yPos = (yPos);
            listObj[item.id] = item;
        });
    }

    // Calculate the x offset based on maxX
    let calculatedOffset = maxX +scale*(pageWidth +pageMargin*countPagesOnMaxXLevel);
    Object.values(listObj).forEach( (item, index) => {
        item.xPos += calculatedOffset;
    });
    maxX += calculatedOffset;

    return {listObjWithCoords: listObj, maxX, maxY};
}

const styles = StyleSheet.create({

    layerContainer: {
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
    },
    
});