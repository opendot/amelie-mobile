import React from 'react';
import { View, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { connect } from 'react-redux';

// component
import Dimensions from 'Dimensions';
import {renderIf} from "../../utils/utils"
import AirettSimpleHeader from "../../utils/airettSimpleHeader"
import CardCarousel from "../cardCarousel"
import EditPageView from "../editPageView";
import PageColorSelector from '../pageColorSelector';
import I18n from '../../i18n/i18n';

// third party
import { Container, Content, Col, Icon, Grid, Footer } from 'native-base';
import Orientation from 'react-native-orientation';
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { cloneCard, getAllCards } from '../../actions/CardActions';
import { updateCardList } from '../../actions/WSactions';
import { showErrorModal } from '../../actions/ModalAction';
import { calculateDefaultCardsPosition, calculateDefaultCardsPositionWhenUndefined } from "../../utils/pages";

// styles
import theme, { baseStyles } from '../../themes/base-theme'
import pageTheme from "../../themes/page-theme";

/** 
 * Screen used to edit a page.
 * Add or delete cards and change their positions and scale
 * @param page the page to edit
 * @param index index of page in the Tree
 * @param onPageEdited function called when the page is edited, return the new page and the edited page
 */
class PageEditScreen extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        header: null,
    });

    constructor( props ){
        super(props);
        let page = this.getPageToEdit() || {};
        this.state = {
            page: JSON.parse(JSON.stringify(page)),// Page with temporary edits
            textTags: "", //   Search term for the cards
            hideTagsTextInput: false,// Hide tags when orientation is landscape
            keyboardIsVisible: false,// Hide buttons when keyboard is visible
            carousel: true,
            orientation: 'PORTRAIT',
            loading: false,
        }

        /** Ask the server for a list of cards, prevent multiple sending events */
        this.getAllCardsDebounce = debounce(this.props.getAllCards, 200);
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        this.getAllCardsDebounce( this.props.currentPatient, "", 1, (cardList) => {
            this.props.updateCardList(cardList);
        } );
    }

    componentDidMount() {
        if( Platform.OS == "android"){
            // On Android the listener is never called https://github.com/yamill/react-native-orientation/issues/220
            Dimensions.addEventListener('change', this._dimensionsDidChange);
        }
        else {
            Orientation.addOrientationListener(this._orientationDidChange);
        }
        setTimeout(this.keepKeyboardOpen, 200);
    }

    componentWillUnmount () {
        // Remove listeners
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();

        if( Platform.OS == "android"){
            Dimensions.removeEventListener('change', this._dimensionsDidChange);
        }
        else {
            Orientation.removeOrientationListener(this._orientationDidChange);
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        // Detect entering this page by a back event on naviigation.
        if (prevProps.navigation.state.key != prevProps.route &&
            this.props.navigation.state.key == this.props.route &&
            this.props.navigation.state.routeName == "PageEdit") {
                setTimeout(() => {
                    this._textInput.focus();
                }, 300);
            }
    }

    _keyboardDidShow = () => {
        this.setState({keyboardIsVisible: true});
    }  
    _keyboardDidHide = () => {
        this.setState({keyboardIsVisible: false});
    }

    _dimensionsDidChange = ({ window: { width, height } }) => {
        // On Android the Orientation listener is never called https://github.com/yamill/react-native-orientation/issues/220
        const orientation = width > height ? 'LANDSCAPE' : 'PORTRAIT';
        this._orientationDidChange(orientation);
    }

    /**
     * Callback for when Phone orientation change
     * @param {string} orientation possible values [LANDSCAPE, PORTRAIT, PORTRAITUPSIDEDOWN, UNKNOWN]
     */
    _orientationDidChange = (orientation) => {
        let showCarousel = orientation !== "LANDSCAPE"
        // Allow to edit card position when phone is in landscape
        this.setState({ hideTagsTextInput: orientation == "LANDSCAPE", carousel: showCarousel, orientation});
        if(orientation !== "LANDSCAPE"){
          this.keepKeyboardOpen();
        }
        else {
            Keyboard.dismiss();
        }
    }
    
    /** To keep the keyboard open, if the TextInput lose the focus, set the focus to him */
    keepKeyboardOpen = () => {
        // Only do this if this is the visible page
        if( this.props.route == this.props.navigation.state.key && this._textInput) {
            this._textInput.focus();
        }
    }

    /** Return the card received as params by the page, or undefined */
    getPageToEdit = ( props = this.props ) => {
        return props.navigation.state.params ? props.navigation.state.params.page : undefined;
    }

    /** Return the card received as params by the page, or undefined */
    getPageIndex = ( props = this.props ) => {
        return props.navigation.state.params ? props.navigation.state.params.index : undefined;
    }

    goBack = () => {
        this.props.navigation.goBack();
    }

    /** Function called when a page is edited */
    setCardAt = ({card, index}) => {
        // Apply the edits locally
        let tempPage = JSON.parse(JSON.stringify(this.state.page));
        if( index >= 0 && index < tempPage.cards.length){
            tempPage.cards[index] = card;
        }
        else {
            tempPage.cards.push(card);
        }

        this.setState({ page: tempPage });

    }

    /** Apply all the edits on the page */
    applyPageEdit = () => {
        let params = this.props.navigation.state.params;
        if( params ){
            // Apply default positions
            let tempPage = JSON.parse(JSON.stringify(this.state.page));
            calculateDefaultCardsPositionWhenUndefined( tempPage);

            // Call the callback to apply the edits
            params.onPageEdited( tempPage,  //  The edited page
                params.index,    //  The index of the page
                params.page    //  The original page provided as a param
            );
        }
        
        // Close this page
        this.goBack();
    }

    /** Reset all the edits applyied to the page */
    resetPage = () => {
        this.setState({ page: this.getPageToEdit()});
    }

    /** Set the given card as not selectable
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickHide = ( card, index, page ) => {
        // console.log("PageEditScreen onCardClickEdit "+index, card);
        let updatedCard = JSON.parse( JSON.stringify(card));
        let oldCard = page.cards[index];
        updatedCard.selectable = (oldCard.selectable == false ? true : false);

        this.setCardAt({card: updatedCard, index});

        // Deselect card
        this.setState({ clicked:false, clickedObj:{} });
    }

    /** Edit the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickEdit = ( card, index, page ) => {
        Keyboard.dismiss();
        this.props.navigation.navigate('cardBuilder', {card, index, page,
            onCardEdited: (updatedCard) => {
                let tempPage = JSON.parse( JSON.stringify(page));

                // Add the previous position and scale to the updated card
                let oldCard = tempPage.cards[index];
                updatedCard.x_pos = oldCard.x_pos;
                updatedCard.y_pos = oldCard.y_pos;
                updatedCard.scale = oldCard.scale;

                // Update the card by updating the whole page
                tempPage.cards[index] = updatedCard;
                this.setState({ page: tempPage });
            }, forceArchived: true
        });
        
        // Deselect card
        this.editPage.resetSelectedCard();
    }

    /** Edit the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickCopy = ( card, index, page ) => {
        // console.log("PageEditScreen onCardClickCopy "+index, card);
        if( this.state.loading ) {return;}

        if( this.state.page.cards.length < pageTheme.maxCards){
            this.setState( {loading: true}, () => {
                this.props.cloneCard( card, (clonedCard) => {
                    if ( clonedCard ) {
                        // Duplicate the card
                        let tempCards = this.state.page.cards.splice(0);
                        tempCards.push(clonedCard);
                        let tempPage = JSON.parse(JSON.stringify(this.state.page));
                        tempPage.cards = tempCards;
                        this.setState({ page: calculateDefaultCardsPosition(tempPage) });

                        // Deselect card
                        if( this.editPage ) {
                            this.editPage.resetSelectedCard();
                        }
                    }

                    this.setState( {loading: false});

                });
            });
        }
        else {
            // Notify the user that there are too many cards in this page
            this.showErrorLimitCards();

            // Deselect card
            if( this.editPage ) {
                this.editPage.resetSelectedCard();
            }
        }
    }

    /** On card long press, remove the selected card from the list of card of the page */
    onCardClickDelete = (card, index, page) => {
        if( this.state.page.cards && index >= 0 && index < this.state.page.cards.length){
            // Remove card at given index
            let tempCards = this.state.page.cards.splice(0);
            tempCards.splice(index, 1);
            let tempPage = JSON.parse(JSON.stringify(this.state.page));
            tempPage.cards = tempCards;
            this.setState({ page: tempPage });
        }
        
        // Deselect card
        this.editPage.resetSelectedCard();
    }

    /** On card click, add the selected card to the list of card of the page */
    onCarouselCardPress = (card) => {
        if( !this.state.page.cards ){
            // This should never happen
            this.props.showErrorModal( null, `Impossibile aggiungere una nuova card! Pagina non valida`);
        }

        // Add the card at the end of the list
        if( this.state.page.cards.length < pageTheme.maxCards){
            // Add card to bottom
            this.setCardAt({card:card, index: this.state.page.cards.length});
            this.setState({textTags: ""});
        }
        else {
            // Max cards limit reached, notify the user
            // show a modal to the user
            this.showErrorLimitCards();
        }
    }

    /** There is alimit of cards in the page, show an error message to notify the user */
    showErrorLimitCards = () => {
        this.props.showErrorModal( null, `Non puoi aggiungere più di ${pageTheme.maxCards} card in una pagina`);
    }

    setPageColor = (color) => {
        this.setState({page: {...this.state.page, background_color: color}});
    }

    onTextChanged = () => {
        this.tryResetList();
    }

    tryResetList = debounce( () => {
        if(this.carouselList) {
            this.carouselList.tryResetList();
        }
    }, 250, {leading: false, trailing: true});

    render() {
        let page = this.state.page;
        return (
            <Container theme={theme}>
                {renderIf(this.state.carousel, <AirettSimpleHeader title={I18n.t("page.edit")}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={this.goBack} />)}
                <Content scrollEnabled={false} style={baseStyles.fullPage} contentContainerStyle={baseStyles.fullPage} keyboardShouldPersistTaps='always'>
                    <KeyboardAvoidingView style={baseStyles.fullPage} contentContainerStyle={baseStyles.fullPage}
                        keyboardVerticalOffset={this.state.carousel ? theme.toolbarHeight : 0} 
                        behavior={Platform.OS == "ios" && !this.state.hideTagsTextInput ? "height" : undefined} >
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <EditPageView
                                ref={ (editPage) => {this.editPage = editPage;}}
                                page={page} pageIndex={this.getPageIndex()}
                                cards={page.cards}
                                showGrid={this.state.orientation == "LANDSCAPE"}
                                setCardAt={this.setCardAt}
                                onCardClickHide={this.onCardClickHide}
                                onCardClickEdit={this.onCardClickEdit}
                                onCardClickCopy={this.onCardClickCopy}
                                onCardClickDelete={this.onCardClickDelete} />
                            {renderIf(this.state.orientation == "LANDSCAPE",<PageColorSelector onColorSelected={this.setPageColor}/>)}
                        </View>
                        <View style={{position:'absolute', bottom: 0, left: 0, right: 0}} >
                            {renderIf(this.state.carousel,<CardCarousel style={{backgroundColor: pageTheme.carouselBackground}}
                                                                        allowCardCreation={true}
                                                                        cardsFilter={page.cards}
                                                                        onListRef={component => this.carouselList = component}
                                                                        navigation={this.props.navigation}
                                                                        onCardPress={this.onCarouselCardPress}
                                                                        searchText={this.state.textTags}/>)}
                            <AddNewCards navigation={this.props.navigation}
                                hidden={this.state.hideTagsTextInput}
                                cardlist={this.props.cardlist} onCarouselCardPress={this.onCarouselCardPress}
                                onChangeText={(textTags) => {
                                    this.setState({textTags}, this.onTextChanged);
                                    // this.getAllCardsDebounce( this.props.currentPatient, textTags, 1, (listOfCards) => {
                                    //     this.props.updateCardList(listOfCards);
                                    // });
                                }}
                                onSend={this.applyPageEdit}
                                value={this.state.textTags}
                                textInputRef={(component) => {this._textInput = component;}}
                                onBlur = {this.keepKeyboardOpen}
                            />
                        </View>
                    </KeyboardAvoidingView>
                </Content>
            </Container>
        );
    }

}

/** Show the TextInput to search cards by tags and the list of cards */
function AddNewCards( props ){
    if( props.hidden){ return null;}
    return (
      <Footer style={{height:40, backgroundColor:"white"}}>
          <Grid>
              <Col><TextInput
                  ref = {props.textInputRef}
                  onBlur = {props.onBlur}
                  style={{width:'100%',backgroundColor:'#fff',height: 40, borderColor: 'transparent', borderWidth: 0, marginBottom:10}}
                  onChangeText={props.onChangeText}
                  onSubmitEditing={props.onSend}
                  value={props.value}
              />
              </Col>
              <Col style={{ width: 65 }}>
                  <TouchableOpacity onPress={props.onSend} style={{backgroundColor: theme.brandGreen, margin:4, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center'}}>
                  <Icon style={{ fontSize:20, color:"white"}} name={"md-checkmark"}/>
                  </TouchableOpacity>
              </Col>
          </Grid>


      </Footer>
    );
}

const mapStateToProps = (state) => {
    return {
        cardlist: state.webSocketReducer.cardlist,
        currentPatient: state.authenticationReducer.currentPatient,
        ip: state.webSocketReducer.ip,
        route: state.webSocketReducer.route,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        cloneCard: (card, callback) => {dispatch(cloneCard(card, callback))},
        getAllCards: (patient, txt, page, callback) => {dispatch(getAllCards(patient, txt, page, callback))},
        updateCardList: (list) => {dispatch(updateCardList(list))},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PageEditScreen);