import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";

// component
import SnapGrid from "../utils/snapGrid";
import VideoIcon from "../utils/videoIcon";

// third party
import { Icon } from 'native-base';
import { Line, Svg, Polygon } from "react-native-svg";

// action
import { isCardImage } from "../actions/CardActions";

// styles
import theme from "../themes/base-theme";
import pageTheme from "../themes/page-theme";

const colorAccent = theme.brandPrimary;
const cardPadding = 2;

const BUTTON_TYPES = { POPUP: "popup" };
/**
 * A single page element, containing any number of cards
 * This item is seen full screen on a PC, so it has a fixed aspect ratio of 1280x720
 * @param {any} page 
 * @param {any[]} page.cards 
 * @param {string} ip the ip address where to find the image
 * @param {float} scale default is 1.0
 */
export default class PageItem extends React.Component {

    onPageClick = (e) => {
        if( this.props.onPageClick ){
            this.props.onPageClick( this.props.page, this.props.pageIndex );
        }
        else {
            e.preventDefault();
        }
    }

    onPageLongPress = () => {
        if( this.props.onPageLongPress ){
            this.props.onPageLongPress( this.props.page, this.props.pageIndex );
        }
    }
    
    /** Position X of the topLeft corner of the selected card in the screen */
    getSelectedCardButtonX = ( selectedCard, buttonType = null) => {
        switch(buttonType) {
            default: 
            return this.props.xPos +cardPadding                         // Corner TopLeft of the page
                +pageTheme.width*this.props.scale*selectedCard.x_pos    // Corner TopLeft of the card inside the page
                +pageTheme.cardBaseWidth*selectedCard.scale*this.props.scale/2  // Show the button in the middle of the card
                ;
        }
    }

    /** Position Y of the topLeft corner of the selected card in the screen */
    getSelectedCardButtonY = ( selectedCard, buttonType = null) => {
        switch(buttonType) {
            case BUTTON_TYPES.POPUP:
            return this.props.yPos +cardPadding                             // Corner TopLeft of the page
                +pageTheme.height*this.props.scale*selectedCard.y_pos       // Corner TopLeft of the card inside the page
                +pageTheme.cardBaseHeight*selectedCard.scale*this.props.scale*0.75 // Show the button in the middle of the card
                ;
            default: 
            return this.props.yPos -cardPadding                             // Corner TopLeft of the page
                +pageTheme.height*this.props.scale*selectedCard.y_pos       // Corner TopLeft of the card inside the page
                +pageTheme.cardBaseHeight*selectedCard.scale*this.props.scale   // Show the button at the bottom of the card
                ;
        }
    }
    
    render() {
        // Show the PlusButton on the selected card
        let selectedCard = this.props.selectedCardIndex != null ? this.props.page.cards[this.props.selectedCardIndex] : null;
        return (
            <View>
                <TouchableOpacity style={{width: pageTheme.width*this.props.scale, height: pageTheme.height*this.props.scale, backgroundColor: this.props.page.background_color || 'black',
                    borderWidth: this.props.selected ? 1 : 0, borderColor: theme.brandPrimary,
                    flexDirection: "row", flexWrap: "wrap",
                    position:"absolute", top:this.props.yPos, left:this.props.xPos}}
                    disabled={this.props.onPageClick || this.props.onPageLongPress ? false : true}
                    onPress={this.onPageClick} onLongPress={this.onPageLongPress} >
                    <SnapGrid hide={this.props.showGrid ? false : true} />
                    {this.props.page.cards.map((card,index) => {
                        return(
                            <Card card={card} cardIndex={index} page={this.props.page} ip={this.props.ip} 
                                key={`card_${index}_${card.id}`}
                                pageScale={this.props.scale}
                                pageWidth={pageTheme.width*this.props.scale}
                                pageHeight={pageTheme.height*this.props.scale}
                                selectableIconEnabled={this.props.selectableIconEnabled}
                                selected={this.props.selectedCardIndex != null && this.props.selectedCardIndex == index}
                                onCardClick={this.props.onCardClick}
                                onCardPressIn={this.props.onCardPressIn}
                                onCardPressOut={this.props.onCardPressOut}
                                delayCardPressIn={this.props.delayCardPressIn}
                                delayCardPressOut={this.props.delayCardPressOut}
                                onCardLongPress={this.props.onCardLongPress} />
                        )
                    })}
                    
                </TouchableOpacity>
                {selectedCard ?
                    <PlusButton buttonType={this.props.buttonType}
                        x={this.getSelectedCardButtonX(selectedCard, this.props.buttonType)} 
                        y={this.getSelectedCardButtonY(selectedCard, this.props.buttonType)} 
                        onClickHide={this.props.onCardClickHide ? () => this.props.onCardClickHide(selectedCard, this.props.selectedCardIndex, this.props.page) : null}
                        onClickAdd={this.props.onNewPageClick ? () => this.props.onNewPageClick(selectedCard, this.props.selectedCardIndex, this.props.page) : null}
                        onClickEdit={this.props.onCardClickEdit ? () => this.props.onCardClickEdit(selectedCard, this.props.selectedCardIndex, this.props.page) : null}
                        onClickCopy={this.props.onCardClickCopy ? () => this.props.onCardClickCopy(selectedCard, this.props.selectedCardIndex, this.props.page) : null}
                        onClickDelete={this.props.onCardClickDelete ? () => this.props.onCardClickDelete(selectedCard, this.props.selectedCardIndex, this.props.page) : null}/>
                : null }
                {this.props.selected ?
                    <PageButton 
                        x={this.props.xPos +cardPadding     +pageTheme.width*this.props.scale/2} 
                        y={this.props.yPos} 
                        pasteCard={this.props.pasteCard}
                        onClickEdit={this.props.onPageClickEdit ? () => this.props.onPageClickEdit(this.props.page, this.props.pageIndex) : null}
                        onClickCopy={this.props.onPageClickCopy ? () => this.props.onPageClickCopy(this.props.page, this.props.pageIndex) : null}
                        onClickPaste={this.props.onPageClickPaste ? () => this.props.onPageClickPaste(this.props.page, this.props.pageIndex, this.props.pasteCard) : null}
                        onClickDelete={this.props.onPageClickDelete ? () => this.props.onPageClickDelete(this.props.page, this.props.pageIndex) : null}/>
                : null }
            </View>
        );
    }
}

/** A single card, an image with the card text */
function Card( props){
    const totalScale = props.card.scale*props.pageScale;
    return (
        <TouchableOpacity
            style={{padding: cardPadding, width: pageTheme.cardBaseWidth*totalScale, height: pageTheme.cardBaseHeight*totalScale,
                position: "absolute", top: props.card.y_pos*props.pageHeight, left: props.card.x_pos*props.pageWidth,}}
            onPress={() => {
                if( props.onCardClick ){
                    return props.onCardClick(props.card, props.cardIndex, props.page);
                }
            }}
            onPressIn={ props.onCardPressIn ? () =>{props.onCardPressIn(props.card, props.cardIndex, props.page)} : undefined}
            onPressOut={props.onCardPressOut ? () =>{props.onCardPressOut(props.card, props.cardIndex, props.page)} : undefined}
            delayPressIn={props.delayCardPressIn}
            delayPressOut={props.delayCardPressOut}
            onLongPress={() => {
                if( props.onCardLongPress ){
                    return props.onCardLongPress(props.card, props.cardIndex, props.page);
                }
            }}>
            { props.card.content.type == "Text" ?
             <Text style={[styles.cardText, {flex: 1, textAlign: "center", textAlignVertical: "center", backgroundColor: "white", fontSize: 8*totalScale, fontWeight: 'bold'}]}>{props.card.label.toUpperCase()}</Text>
            :
            <View
                style={{
                    flex: 1, backgroundColor: "white",
                    borderWidth: props.selected ? cardPadding : 0,
                    borderColor: colorAccent,
                }}>
                <Image
                    style={[styles.cardImage, {width: (pageTheme.cardBaseWidth -cardPadding*2)*totalScale}]}
                    source={{uri: totalScale > 2 && isCardImage(props.card.content.type) ? props.card.content.content : props.card.content.content_thumbnail}}
                />
                <Text style={[styles.cardText, {fontSize: 7 * totalScale * (props.card.label && props.card.label.length > 8 ? 8.5 / props.card.label.length: 1)}]} numberOfLines={1}>{props.card.label.toUpperCase()}</Text>
            </View>
            }
            <VideoIcon type={props.card.content.type} totalScale={totalScale} cardPadding={cardPadding} />
            <SelectableIcon enabled={props.selectableIconEnabled} selectable={props.card.selectable} totalScale={totalScale} />
        </TouchableOpacity>
    );
}

function SelectableIcon(props) {
    if(props.selectable != false || !props.enabled) {
        return null;
    }
    else {
        return(
            <Icon name={"md-eye-off"}
                style={{position: "absolute", backgroundColor: "white",
                    margin: 2*cardPadding, padding: 2, fontSize: 7*props.totalScale}}
                />
        );
    }
}

/** Button used to add a link to a card */
function PageButton( props){
    let siz = 40;
    let numberOfButtons = props.pasteCard ? 4 : 3;
    let buttonsContainerWidth = numberOfButtons *siz;// Number of buttons X size of a single button
    let offsetTop = siz+15+(Platform.OS === "ios" ? 4+1 : 0);// icon height + line height + iconButtonMargin + pageItem.borderWidth
    const color = theme.brandPrimary;
    return (
        <View
            style={{justifyContent:'center', position: 'absolute', top: props.y -offsetTop, left:props.x-buttonsContainerWidth/2, width: buttonsContainerWidth, zIndex: 2}}
        >

            <View style={[styles.iconButtonContainer, {backgroundColor: color, top : 0,}]} >
                <IconButton name={"md-create"}
                    hide={!props.onClickEdit}
                    backgroundColor={color}
                    onPress={props.onClickEdit}
                    size={siz} />
                <IconButton name={"md-copy"}
                    hide={!props.onClickCopy}
                    backgroundColor={color}
                    onPress={props.onClickCopy}
                    size={siz} />
                <IconButton name={"md-clipboard"}
                    hide={!props.pasteCard}
                    backgroundColor={color}
                    onPress={props.onClickPaste}
                    size={siz} />
                <IconButton name={"ios-trash"}
                    hide={!props.onClickDelete}
                    backgroundColor={color}
                    onPress={props.onClickDelete}
                    size={siz} />
            </View>
            <Svg width={buttonsContainerWidth/2} height={15}>
                <Line
                    x1={buttonsContainerWidth/2-2}
                    y1={0}
                    x2={buttonsContainerWidth/2-2}
                    y2={15}
                    stroke={color}
                    strokeWidth="2"
                />
            </Svg>
        </View>
    );
}

/** Button used to add a link to a card */
function PlusButton( props){
    let siz = 40;
    let sizeWithMargin = siz+4*2;
    let numberOfButtons = 0;
    if( props.onClickAdd){ numberOfButtons++;}
    if( props.onClickEdit){ numberOfButtons++;}
    if( props.onClickCopy){ numberOfButtons++;}
    if( props.onClickDelete){ numberOfButtons++;}
    let buttonsContainerWidth = numberOfButtons *(sizeWithMargin);// Number of buttons X size of a single button
    let extraStyle = numberOfButtons == 1 ? {width: sizeWithMargin, height: sizeWithMargin, borderRadius: sizeWithMargin/2 } : {};
    
    if( numberOfButtons == 0){return null;}

    // Show a different graphic based on buttonType
    switch( props.buttonType ){
        case BUTTON_TYPES.POPUP:
        return (
            <View
                style={{justifyContent:'center',position: 'absolute', top: props.y -sizeWithMargin -15, left:props.x-buttonsContainerWidth/2-2, width: buttonsContainerWidth, zIndex: 2}}
            >

                <View style={[styles.iconButtonContainer, extraStyle, {top: 2}]} >
                    <IconButton name={"md-eye-off"}
                        hide={!props.onClickHide}
                        onPress={props.onClickHide}
                        size={siz} />
                    <IconButton name={"md-add"}
                        hide={!props.onClickAdd}
                        onPress={props.onClickAdd}
                        size={siz} />
                    <IconButton name={"md-create"}
                        hide={!props.onClickEdit}
                        onPress={props.onClickEdit}
                        size={siz} />
                    <IconButton name={"md-copy"}
                        hide={!props.onClickCopy}
                        onPress={props.onClickCopy}
                        size={siz} />
                    <IconButton name={"ios-trash"}
                        hide={!props.onClickDelete}
                        onPress={props.onClickDelete}
                        size={siz} />
                </View>
                <Svg width={buttonsContainerWidth} height={15}>
                    <Polygon
                        points={`${buttonsContainerWidth/2 -7},0 ${buttonsContainerWidth/2 +7},0 ${buttonsContainerWidth/2},15`}
                        fill={colorAccent}
                        stroke={colorAccent}
                        strokeWidth="1"
                    />
                </Svg>
            </View>
        );

        default:
        return (
            <View
                style={{justifyContent:'center',position: 'absolute', top: props.y, left:props.x-buttonsContainerWidth/2-2, width: buttonsContainerWidth}}
            >

                <Svg width={buttonsContainerWidth} height={15}>
                    <Line
                        x1={buttonsContainerWidth/2}
                        y1={0}
                        x2={buttonsContainerWidth/2}
                        y2={15}
                        stroke={colorAccent}
                        strokeWidth="2"
                    />
                </Svg>
                <View style={[styles.iconButtonContainer, extraStyle]} >
                    <IconButton name={"md-add"}
                            hide={!props.onClickAdd}
                        onPress={props.onClickAdd}
                        size={siz} />
                    <IconButton name={"md-create"}
                        hide={!props.onClickEdit}
                        onPress={props.onClickEdit}
                        size={siz} />
                    <IconButton name={"md-copy"}
                        hide={!props.onClickCopy}
                        onPress={props.onClickCopy}
                        size={siz} />
                    <IconButton name={"ios-trash"}
                        hide={!props.onClickDelete}
                        onPress={props.onClickDelete}
                        size={siz} />
                </View>
            </View>
        );
    }
}

function IconButton( props ){
    if( props.hide){ return null;}
    return (
        <TouchableOpacity style={{justifyContent: "center"}} onPress={props.onPress}>
            <Icon name={props.name}
                style={{backgroundColor: props.backgroundColor || "transparent", color: "white", fontSize:props.size,}}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    
    cardImage: {
        flex: 1,
        resizeMode:'contain',
        alignSelf: 'center',
        backgroundColor:'white',
        width: 50,
    },

    cardText: {
        color:'#000',
        textAlign: 'center',
        padding:3,
        fontSize:10,
        fontWeight: 'bold',
    },

    iconButtonContainer: {
        flexDirection : "row",
        justifyContent : "space-around",
        position : 'relative',
        top : -1,
        backgroundColor : colorAccent,
        borderRadius : 4,
    }

});