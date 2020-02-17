import React from 'react';
import { View, TextInput, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

// component
import Dimensions from 'Dimensions';
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import {renderIf, navigateToFlowComposerScreen} from "../../utils/utils"
import PageItem from "../pageItem";
import CardCarousel from "../cardCarousel"
import EditPageView from "../editPageView";
import PageColorSelector from "../pageColorSelector";
import I18n from '../../i18n/i18n';

// third party
import { Container,  Icon,  Content,  Grid, Col } from 'native-base';
import Orientation from 'react-native-orientation';
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import {sendQueryText, updateCardList, setCards, setCardAt, send, setPage, addPageToCurrentTree, setTree} from '../../actions/WSactions';
import { cloneCard, getAllCards } from '../../actions/CardActions';
import { getLinkedPageFromPage } from "../../actions/TreeActions";
import {showErrorModal} from '../../actions/ModalAction';
import { calculateDefaultCardsPositionWhenUndefined } from "../../utils/pages";

// styles
import theme, { baseStyles } from '../../themes/base-theme'
import pageTheme from "../../themes/page-theme";

/** Screen used to create a new page */
class ComposeScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props)

        this.state = {
            contentWidth: -1,
            contentHeight: -1,
            loading: false,
            text: '',
            index:0,
            carousel:false,
            showEditCards: false,
            clicked: false,
            clickedObj:{},
        }

        this._keyboardDidShow = this._keyboardDidShow.bind(this);
        this._keyboardDidHide = this._keyboardDidHide.bind(this);
        this._onSend = this._onSend.bind(this);

        // Flag used to reset values if page creation is aborted
        this.pageSaved = false;

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
        if( Platform.OS == "android")
            // On Android the listener is never called https://github.com/yamill/react-native-orientation/issues/220
            Dimensions.addEventListener('change', this._dimensionsDidChange);
        else
            Orientation.addOrientationListener(this._orientationDidChange);

        setTimeout(this.keepKeyboardOpen, 200);
    }

    componentWillUnmount () {

        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();

        if( Platform.OS == "android")
            Dimensions.removeEventListener('change', this._dimensionsDidChange);
        else 
            Orientation.removeOrientationListener(this._orientationDidChange);

        // Undo the card link if page creation is aborted
        if( !this.pageSaved )
            this.abortPageCreation();
    }

    /** Abort the creation of the current page, remove links
     * from existing cards */
    abortPageCreation = () => {
        if( this.props.tree ){
            let tempTree = JSON.parse(JSON.stringify(this.props.tree));

            // Look for the card that links to the current page
            let linkedPage = getLinkedPageFromPage(tempTree.pages, this.props.currpage);
            if( linkedPage && linkedPage.card ){
                /* The action NEWPAGE automatically set a link to the page we're creating, we must remove it */
                linkedPage.card.next_page_id = null;

                // console.log("abortPageCreation after", JSON.parse(JSON.stringify(tempTree)));
                this.props.setTree(tempTree);
            }
        }
        else 
            this.props.setTree(null);
    }

    _keyboardDidShow () {
        this.setState({carousel:true});
    }

    _keyboardDidHide () {
        this.setState({carousel:false});
    }


    /** Complete the page creation and close this screen */
    _onSend () {
        // Calculate default positions for cards
        this.props.setCards( calculateDefaultCardsPositionWhenUndefined({cards: this.props.cards}).cards);

        // Add the current page to the current tree and go to main screen to keep 
        Keyboard.dismiss();
        this.props.addPageToCurrentTree();
        this.pageSaved = true;
        // navigate to FlowComposerScreen, reset navigation history
        navigateToFlowComposerScreen(this.props.navigation)
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.route !== nextProps.navigation.state.key) 
            return false;
        return true;
    }

    _dimensionsDidChange = ({ window: { width, height } }) => {
        // On Android the Orientation listener is never called https://github.com/yamill/react-native-orientation/issues/220
        const orientation = width > height ? 'LANDSCAPE' : 'PORTRAIT';
        this._orientationDidChange(orientation);
    }

    /** To keep the keyboard open, if the TextInput lose the focus, set the focus to him */
    keepKeyboardOpen = () => {
        // Only do this if this is the visible page
        if( this.props.route == this.props.navigation.state.key && this._textInput) {
            this._textInput.focus();
        }
    }

    /**
     * Callback for when Phone orientation change
     * @param {string} orientation possible values [LANDSCAPE, PORTRAIT, PORTRAITUPSIDEDOWN, UNKNOWN]
     */
    _orientationDidChange = (orientation) => {
        // Allow to edit card position when phone is in landscape
        this.setState({ showEditCards: orientation == "LANDSCAPE"});
        if(orientation !== "LANDSCAPE") {
          this.keepKeyboardOpen();
        }
    }

    /** On card click, add the selected card to the list of card of the page */
    onCarouselCardPress = (card) => {
        // Add the card at the end of the list
        if( this.props.cards.length < pageTheme.maxCards){
            // Add selectable to card
            card.selectable = true;

            // Add a duplicate of the card, this way I can add multiple instances of the same card
            // Also reset cards position
            let tempCards = JSON.parse(JSON.stringify(this.props.cards));
            tempCards.push(JSON.parse(JSON.stringify(card)));
            this.props.setCardAt({card:JSON.parse(JSON.stringify(card)), index:this.props.cards.length +1});
            //this.props.setCards(calculateDefaultCardsPosition({cards: tempCards}).cards);
            this.setState({text: ""});
        }
        else {
            // Max cards limit reached, notify the user
            // show a modal to the user
            this.showErrorLimitCards();
        }
    }

    /** On card click, remove the selected card from the list of card of the page */
    onListCardLongPress = (card, index) => {
        if( index > -1 && index < this.props.cards.length){
            // Remove card at given index
            let tempCards = this.props.cards.splice(0);
            tempCards.splice(index, 1);
            this.props.setCards(tempCards);
        }
    }

    /** Measure width and height of the Content component to scale the page */
    onContentLayout = (evt) => {
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

    onPageClick = ( page, index ) => {
        // Deselect card
        this.setState({ clicked:false, clickedObj:{} });
        if( this.editPage ) {
            this.editPage.resetSelectedCard();
        }
    }

    /** Function called when a card inside a page is clicked
     * Show the button to add a new page */
    onCardClick = ( card, index, page) => {
        // console.log("ComposeScreen onCardClick "+card.id, card);
        if( this.state.clickedObj.card == card.id){
            this.setState({ clicked:false, clickedObj:{} });
        }
        else {
            this.setState({
                clicked:true,
                clickedObj:{ page: page.id, card:card.id, pos:index, level:page.level}
            });
        }
    }

    /** Set the given card as not selectable
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickHide = ( card, index, page ) => {
        // console.log("ComposeScreen onCardClickEdit "+index, card);
        let updatedCard = JSON.parse( JSON.stringify(card));
        let oldCard = page.cards[index];
        updatedCard.selectable = (oldCard.selectable ? false : true);

        this.props.setCardAt({card: updatedCard, index});

        // Deselect card
        this.setState({ clicked:false, clickedObj:{} });
        if( this.editPage ) {
            this.editPage.resetSelectedCard();
        }
    }

    /** Edit the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickEdit = ( card, index, page ) => {
        // console.log("ComposeScreen onCardClickEdit "+index, card);
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
                this.props.setCardAt({card: updatedCard, index});
            }, forceArchived: true
        });

        // Deselect card
        this.setState({ clicked:false, clickedObj:{} });
        if( this.editPage ) {
            this.editPage.resetSelectedCard();
        }
    }

    /** Duplicate the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickCopy = ( card, index, page ) => {
        // console.log("ComposeScreen onCardClickCopy "+index, card);
        if( this.state.loading ) {return;}

        // Duplicate the card
        if( this.props.cards.length < pageTheme.maxCards){
            this.setState( {loading: true}, () => {
                this.props.cloneCard( card, (clonedCard) => {
                    if ( clonedCard ) {
                        this.props.setCardAt({card:clonedCard, index:this.props.cards.length +1});

                        // Deselect card
                        this.setState({ clicked:false, clickedObj:{} });
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
            this.setState({ clicked:false, clickedObj:{} });
            if( this.editPage ) {
                this.editPage.resetSelectedCard();
            }
        }

    }

    /** Delete the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickDelete = ( card, index, page ) => {
        if( index > -1 && index < this.props.cards.length){
            // Remove card at given index
            let tempCards = this.props.cards.splice(0);
            tempCards.splice(index, 1);
            this.props.setCards(tempCards);
        }
        // Deselect card
        this.setState({ clicked:false, clickedObj:{} });
        if( this.editPage ) {
            this.editPage.resetSelectedCard();
        }
    }    

    /** There is alimit of cards in the page, show an error message to notify the user */
    showErrorLimitCards = () => {
        this.props.showErrorModal( null, `Non puoi aggiungere più di ${pageTheme.maxCards} card in una pagina`);
    }

    setPageColor = (color) => {
        this.props.editPage({...this.props.currpage, background_color: color})
    }

    componentDidUpdate = (prevProps, prevState) => {
        // Detect entering this page by a back event on naviigation.
        if (prevProps.navigation.state.key != prevProps.route &&
            this.props.navigation.state.key == this.props.route &&
            this.props.navigation.state.routeName == "Compose") {
                setTimeout(() => {
                    this._textInput.focus();
                }, 300);
            }
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
        let gheight = Dimensions.get('window').height;
        let gwidth = Dimensions.get('window').width;
        let iconname = this.props.liveView ? 'ios-arrow-up' : 'ios-arrow-down';

        const { navigate } = this.props.navigation;
        
        if( this.state.showEditCards && this.props.cards.length > 0){
            // Edit card position when phone is in landscape
            return (
                <Container theme={theme} style={{flexDirection: 'row'}}>
                    <EditPageView
                        ref={ (editPage) => {this.editPage = editPage;}}
                        page={this.props.currpage}
                        cards={this.props.cards}
                        showGrid={true}
                        onCardClickHide={this.onCardClickHide}
                        onCardClickEdit={this.onCardClickEdit}
                        onCardClickCopy={this.onCardClickCopy}
                        onCardClickDelete={this.onCardClickDelete}
                        setCardAt={this.props.setCardAt}/>
                    <PageColorSelector onColorSelected={this.setPageColor}/>
                </Container>
            );
        }
        else {
            // Insert new cards to the page when phone is in portrait
            return (
                <Container >
                    <AirettSimpleHeader title={I18n.t("page.create")}
                        leftIconName={"md-arrow-back"}
                        onLeftButtonPress={() => this.props.navigation.goBack()} />
                    <Content contentContainerStyle={baseStyles.fullPage} keyboardShouldPersistTaps='always'
                        scrollEnabled={false} onLayout={this.onContentLayout} >
                        <KeyboardAvoidingView style={baseStyles.fullPage} keyboardVerticalOffset={theme.toolbarHeight} behavior={Platform.OS == "ios" ? "height" : undefined} >
                        <PageItem page={calculateDefaultCardsPositionWhenUndefined({cards: JSON.parse(JSON.stringify(this.props.cards)), background_color: this.props.currpage.background_color})}
                            ip={this.props.ip}
                            xPos={0}
                            yPos={0}
                            selectableIconEnabled={true}
                            scale={this.getPageItemScale()}
                            buttonType={"popup"}
                            selectedCardIndex={this.state.clickedObj ? this.state.clickedObj.pos : null}
                            onPageClick={this.onPageClick}
                            onCardLongPress={this.onCardClick}
                            onCardClickHide={this.onCardClickHide}
                            onCardClickEdit={this.onCardClickEdit}
                            onCardClickCopy={this.onCardClickCopy}
                            onCardClickDelete={this.onCardClickDelete}  />
                        <View style={{position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor:"white"}}>
                            {renderIf(this.state.carousel,<CardCarousel style={{width: this.state.contentWidth, backgroundColor: pageTheme.carouselBackground}}
                                                                        allowCardCreation={true}
                                                                        cardsFilter={this.props.cards}
                                                                        onListRef={component => this.carouselList = component}
                                                                        navigation={this.props.navigation}
                                                                        list={this.props.cardlist}
                                                                        onCardPress={this.onCarouselCardPress}
                                                                        searchText={this.state.text}/>)}
                            <Grid>
                                <Col><TextInput
                                    ref = {component => this._textInput = component}
                                    onBlur = {this.keepKeyboardOpen}
                                    style={{width:'100%',backgroundColor:'#fff',height: 40, borderColor: 'transparent', borderWidth: 0, marginBottom:10}}
                                    onSelectionChange={(event) => this.setState({index:event.nativeEvent.selection.start})}
                                    onChangeText={(text) => {
                                        this.setState({text}, this.onTextChanged);
                                        // this.getAllCardsDebounce( this.props.currentPatient, text, 1, (cardList) => {
                                        //     this.props.updateCardList(cardList);
                                        // } );
                                    }}
                                    onSubmitEditing={this._onSend}
                                    value={this.state.text}
                                />
                                </Col>
                                <Col style={{ width: 65 }}>
                                        <TouchableOpacity onPress={this._onSend} style={{backgroundColor: theme.brandGreen, margin:4, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center'}}>
                                        <Icon style={{ fontSize:20, color:"white"}} name={"md-checkmark"}/>
                                        </TouchableOpacity>
                                </Col>
                            </Grid>
                        </View>
                        </KeyboardAvoidingView>
                    </Content>
                </Container>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        currentPatient: state.authenticationReducer.currentPatient,
        currpage: state.webSocketReducer.currpage,
        tree: state.webSocketReducer.tree,
        cards: state.webSocketReducer.cards,
        cardlist: state.webSocketReducer.cardlist,
        ip: state.webSocketReducer.ip,
        route: state.webSocketReducer.route,
        liveView: state.liveViewReducer.open
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        send: (msg) => {dispatch(send(msg))},
        setTree: (tree) => {dispatch(setTree(tree))},
        addPageToCurrentTree: () => {dispatch(addPageToCurrentTree())},
        editPage: (newPage) => {dispatch(setPage(newPage))},
        sendQuery: (txt) => {dispatch(sendQueryText(txt))},
        setCards: (arr) => {dispatch(setCards(arr))},
        setCardAt: (card) => {dispatch(setCardAt(card))},
        cloneCard: (card, callback) => {dispatch(cloneCard(card, callback))},
        getAllCards: (patient, txt, page, callback) => {dispatch(getAllCards(patient, txt, page, callback))},
        updateCardList: (list) => {dispatch(updateCardList(list))},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposeScreen);
