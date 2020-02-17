import React from 'react';
import {
    View,
    PanResponder
} from 'react-native';
import { connect } from 'react-redux';

// components
import {renderIf} from "../utils/utils"
import PageItem from "./pageItem";

// actions
import { calculateCardNormalizedPosition } from "../utils/pages";

// styles
import { baseStyles } from "../themes/base-theme";
import pageTheme from "../themes/page-theme";

/** View used to edit the cards position on page */
class EditPageView extends React.Component {

    constructor( props ){
        super( props);

        this.state = {
            contentWidth: -1,
            contentHeight: -1,
            selectedCard: null,
            selectedCardIndex: -1,  // Used to show the popup and edit/copy/delete the card
            selectedCardTempX: 0,
            selectedCardTempY: 0,
            selectedCardTempScale: 1.0,
            draggedCard: null,
            draggedCardIndex: -1,   // Used to translate and scale the card
        };

        // Used for scaling
        this.pinchStartDistance = 0;
    }

    componentWillMount() {
        this._initPanResponder();
    }

    /** Initialize PanResponder, the object that retrieve the Gestures */
    _initPanResponder = () => {
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (event, gestureState) => {
                return this.state.draggedCardIndex >= 0 
                    && (gestureState.numberActiveTouches == 1 || gestureState.numberActiveTouches == 2)
                    && (gestureState.dx*gestureState.dx + gestureState.dy*gestureState.dy > 30);
            },
            onPanResponderMove: (event, gestureState) => {
                if( this.state.draggedCardIndex < 0) {return;}
                const { dx, dy, vx, vy } =gestureState;
                switch( gestureState.numberActiveTouches ){
                    case 1:
                        // Move
                        if( Math.abs(vx*vx +vy*vy) > 0.001){
                            // Prevent user from moving too far from tree
                            let limitX = 1.0;
                            let limitY = 1.0;

                            let normdx = dx/this.state.contentWidth;
                            let normdy = dy/this.state.contentHeight;
                            if( this.state.draggedCard.x_pos + normdx < limitX
                                && this.state.draggedCard.x_pos + normdx > -limitX) {
                                this.setState({selectedCardTempX: normdx});
                            }
                            if( this.state.draggedCard.y_pos + normdy < limitY
                                && this.state.draggedCard.y_pos + normdy > -limitY) {
                                this.setState({selectedCardTempY: normdy});
                            }
                        }
                        break;
                    case 2:
                        // Scale
                        if( Math.abs(vy) >= 0.01){
                            let tt = event.nativeEvent.touches;
                            let dPinchX = tt[1].locationX - tt[0].locationX;
                            let dPinchY = tt[1].locationY - tt[0].locationY;
                            let distance = Math.sqrt( dPinchX*dPinchX + dPinchY*dPinchY);
                            if( this.pinchStartDistance <= 0){
                                // Start of the pinch, set the distance
                                this.pinchStartDistance = distance;
                            }
                            let s = distance/this.pinchStartDistance;
                            this.setState({selectedCardTempScale: Math.min( Math.max(s, 0.05), 2)})
                        }
                        break;
                }
            },
            onPanResponderRelease: (e, gestureState) => {
                // Apply the transformations and reset the values
                // Don't call setState if nothing changed
                if( (this.state.selectedCardTempScale != 1.0 || this.state.selectedCardTempX != 0 || this.state.selectedCardTempY != 0)
                    && this.state.draggedCardIndex >= 0){
                    let tempCard = JSON.parse(JSON.stringify(this.state.draggedCard));
                    this.applyCardTransformations(tempCard,
                        this.state.selectedCardTempX, this.state.selectedCardTempY, this.state.selectedCardTempScale);
                    this.props.setCardAt({card: tempCard, index: this.state.draggedCardIndex});
                }

                this.setState({draggedCard: null, draggedCardIndex: -1});
                this.pinchStartDistance = 0;
            }
        });
    }

    /** Measure width and height of the Content component to scale the page */
    onContentLayout = (evt) => {
        if (evt.nativeEvent.layout.width == this.state.contentWidth && evt.nativeEvent.layout.height == this.state.contentHeight) return;
        this.setState({
            // contentX: evt.nativeEvent.layout.x,
            // contentY: evt.nativeEvent.layout.y,
            contentWidth: evt.nativeEvent.layout.width,
            contentHeight: evt.nativeEvent.layout.height,
        });
    }

    /** Calculate the scale to show the Page full screen */
    getPageItemScale = () => {
        if( this.state.contentWidth < 0 || this.state.contentHeight < 0){
            // Values not initialized
            return 1;
        }
        if( this.state.contentWidth/this.state.contentHeight > pageTheme.ratio){
            // Width is greater than height, use height to calculate scale
            return this.state.contentHeight/pageTheme.height;
        }
        else {
            // Height is greater than width, use width to calculate scale
            return this.state.contentWidth/pageTheme.width;
        }
    }

    /** Apply the values of translation and scale to the card */
    applyCardTransformations = (card, tempX = 0, tempY = 0, tempScale = 1.0) => {
        if( card ){
            card.x_pos  += tempX;
            card.y_pos  += tempY;
            card.scale *= tempScale;
        }
        this.setState({ selectedCardTempX: 0, selectedCardTempY: 0, selectedCardTempScale: 1.0});
    }

    /** Reset all values related to the selected card */
    resetSelectedCard = () => {
        this.setState({selectedCard: null, selectedCardIndex: -1, 
            selectedCardTempX: 0, selectedCardTempY: 0, selectedCardTempScale: 1.0});
    }

    onPageClick = ( page, index) => {
        this.resetSelectedCard();
    }

    /** Function called when a card inside a page is clicked
     * Allow to edit the selected card */
    onCardClick = ( card, cardIndex, page) => {
        if( this.state.selectedCard ){
            // Deselect the current card, then select this card
            let tempCard = JSON.parse(JSON.stringify(this.state.selectedCard));
            this.resetSelectedCard();

            if( tempCard.id != card.id) {
                // I've selected another card
                this.setState( { selectedCard: card, selectedCardIndex: cardIndex});
            }
        }
        else {
            // Select the new card
            this.setState( { selectedCard: card, selectedCardIndex: cardIndex});
        }
    }

    onCardPressIn = ( card, cardIndex, page) => {
        // console.log("onCardPressIn "+cardIndex, card);
        this.setState({draggedCard: card, draggedCardIndex: cardIndex});
    }

    /**
     * Create a clone of the page and its cards, apply the default positions
     * if they're not define and also apply the temporary transformatons applyied
     * by the user
     */
    getTempPage = () => {
        /* Duplicate the page and the cards */
        let tempPage = JSON.parse(JSON.stringify(this.props.page));
        tempPage.cards = JSON.parse(JSON.stringify(this.props.cards));

        /* Calculate all the cards positions */
        const count = tempPage.cards.length;
        const rowsCount = count > 2 ? 2 : 1;
        let cardBaseWidth = pageTheme.cardBaseWidth/pageTheme.width, cardBaseHeight = pageTheme.cardBaseHeight/pageTheme.height;
        let cardScale = pageTheme.cardBaseScale;
        // Change width and height to make all cards visible on 1 page
        if( rowsCount > 1){
            // Show cards on 2 lines
            cardBaseWidth /= 2;
            cardBaseHeight /= 2;
            cardScale /= 2;
        }
        tempPage.cards.forEach( (card, index, cards) => {
            if( !card.x_pos || !card.y_pos || !card.scale){
                calculateCardNormalizedPosition(card, index, count, rowsCount, cardBaseWidth, cardBaseHeight, cardScale);
                if( index == this.state.draggedCardIndex){
                    // Show user edits on selected card
                    card.x_pos += this.state.selectedCardTempX;
                    card.y_pos += this.state.selectedCardTempY;
                    card.scale *= this.state.selectedCardTempScale;
                }
            }
            else {
                if( index == this.state.draggedCardIndex){
                    // Show user edits on selected card
                    let originalCard = this.props.cards[index];
                    card.x_pos = originalCard.x_pos +this.state.selectedCardTempX;
                    card.y_pos = originalCard.y_pos +this.state.selectedCardTempY;
                    card.scale = originalCard.scale *this.state.selectedCardTempScale;
                }
            }
        });
        // console.log("getTempPage ", tempPage);
        return tempPage;
    }

    render() {
        let tempPage = this.getTempPage();
        return (
            <View style={baseStyles.fullPage}
                {...this._panResponder.panHandlers} onLayout={this.onContentLayout} >
                {renderIf(this.state.contentWidth > 0 && this.state.contentHeight > 0, 
                <PageItem page={tempPage} showGrid={this.props.showGrid}
                    ip={this.props.ip}
                    xPos={0}
                    yPos={0}
                    selectableIconEnabled={true}
                    scale={this.getPageItemScale()}
                    buttonType={"popup"}
                    onPageClick={this.onPageClick}
                    onCardPressIn={this.onCardPressIn}
                    selectedCardIndex={this.state.selectedCardIndex >= 0 ? this.state.selectedCardIndex : null}
                    onCardClickHide={this.props.onCardClickHide}
                    onCardClickEdit={this.props.onCardClickEdit}
                    onCardClickCopy={this.props.onCardClickCopy}
                    onCardClickDelete={this.props.onCardClickDelete}
                    onCardLongPress={this.onCardClick}  />
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        ip: state.webSocketReducer.ip,
        route: state.webSocketReducer.route,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(EditPageView);