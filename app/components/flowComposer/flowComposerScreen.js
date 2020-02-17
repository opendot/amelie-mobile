import React from 'react';
import { View, TextInput, Keyboard, BackHandler } from 'react-native';
import { connect } from 'react-redux';

// components
import AirettSideMenu from "../airettSideMenu";
import AirettHeader from "../Composer/airettHeader";
import TreeView from "../treeView";
import LiveView from '../liveView/liveView';
import { renderIf } from "../../utils/utils";
import PageItem from "../pageItem";
import LinkLine from "../../utils/linkLine";
import LinkCardModal from "./linkCardModal";
import LoadingModal from "../../utils/loadingModal";
import FlowComposerFooter from "./flowComposerFooter";
import I18n from '../../i18n/i18n';

// third party
import { Container, Icon,Footer,Content,Button, Item } from 'native-base';
import ObjectID from "bson-objectid";// Generate a unique Hex String of 24 characters (12 bytes https://docs.mongodb.com/manual/reference/bson-types/#objectid)

// actions
import { CLIPBOARD } from '../../actions/ActionTypes';
import {send, newPage, newTree, newSession, setTree, setPageAt, deletePageFromTree, deleteCardFromPage} from '../../actions/WSactions';
import {createDefaultName, createTree, updateTree, canCreateLink, createLink, getLinkedPageFromPage, checkIfTreeHasMoreRoots} from '../../actions/TreeActions';
import {linkCardToTree} from '../../actions/CardActions';
import { startTrainingSession, startPreviewSession, createEvent } from "../../actions/SessionActions";
import {copyPage, copyCard} from '../../actions/ClipboardActions';
import {setOpen, setClose} from '../../actions/LiveViewActions';
import {showErrorModal} from '../../actions/ModalAction';

// styles
import theme, { baseStyles } from "../../themes/base-theme";

/**
 * The page that show all the pages in a Tree Structure.
 * From here you can add new pages and send the tree to the desktop application
 */
class FlowComposerScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props)

        this.state = {
            isMenuOpen: false,
            clicked: false,
            clickedObj:{},
            showLinkCardModal: false,
            selectedLink: null,
            name: props.tree.name || createDefaultName(props.currentUser, props.currentPatient),
            sendingTree: false,
            savingTree: false,
            headerTitleOverride: null,
        }

        this.isComponentMounted = false;
    }

    componentDidMount() {
        // handles the hardware back button, same behavior as the exit button
        BackHandler.addEventListener('hardwareBackPress', this._onSessionEndPressed);
        this.isComponentMounted = true;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.isMenuOpen && this.state.isMenuOpen) {
            Keyboard.dismiss();
        }
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
        BackHandler.removeEventListener('hardwareBackPress', this._onSessionEndPressed);
    }


    /** Change the name of the tree */
    onChangeNameText = ( newName) => {
        this.setState({name: newName});
        this.props.setTree({...this.props.tree, name: newName});
    }

    handleNewPage = () => {
        if( this.state.clickedObj.page ){
            this.props.newPage({page:this.state.clickedObj.page, pos:this.state.clickedObj.pos,level:this.state.clickedObj.level+1});
        }
        this.setState({showLinkCardModal: false, clicked:false, clickedObj:{}});

        // Go to page creation
        // Wait for the modal to close, otherwise it interferes with the opening of the Keyboard
        setTimeout(()=>this.props.navigation.navigate('Compose'), 800);
    }


    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.route !== nextProps.navigation.state.key) {
            return false;
        }
        else return true;
    }

    /** Render a single page */
    renderItem = ( item, index, xPos, yPos, scale = 1.0) => {
        return (
            <PageItem page={item} pageIndex={index}
                key={`${index}_${item.id}`}
                ip={this.props.ip}
                xPos={xPos}
                yPos={yPos}
                scale={scale}

                selected={this.state.clickedObj && item.id == this.state.clickedObj.page ? (this.state.clickedObj.pos == undefined) : null}
                pasteCard={this.props.copy && this.props.copy.source == CLIPBOARD.CARD ? this.props.copy.data : null}
                onPageClick={this.onPageClick}
                onPageLongPress={this.onPageLongPress}
                onPageClickEdit={this.onPageClickEdit}
                onPageClickCopy={item.level != 0 ? this.onPageClickCopy : null}
                onPageClickPaste={this.onPageClickPaste}
                onPageClickDelete={item.level != 0 ? this.onPageClickDelete : null}

                selectedCardIndex={this.state.clickedObj && item.id == this.state.clickedObj.page ? this.state.clickedObj.pos : null}
                onCardClick={this.onCardLongPress}
                onCardLongPress={() => this.onPageLongPress(item, index)}
                onNewPageClick={this.onCardClickAdd} />
        );
    }

    onPageClick = ( page, index ) => {
        // console.log("FlowComposerScreen onPageClick "+index, page);
        // If a card was selected show the modal to handle links between 
        // the selected card and this clicked page
        if( this.state.clickedObj.card != undefined){
            let parent = getLinkedPageFromPage(this.props.tree.pages, page);
            let selectedPage = this.props.tree.pages.filter((page) => {
                return page.id == this.state.clickedObj.page;
            })[0];
            if( parent ) {
                // If the page is linked by the selected card, delete the link
                if( this.state.clickedObj.page == parent.page.id && this.state.clickedObj.card == parent.card.id) {
                    this.deleteLink( selectedPage, selectedPage.cards[this.state.clickedObj.pos], page);
                }
            }
            else {
                // If this page hasn't a parent, link it to the curretly selected card
                this.createLink( selectedPage, selectedPage.cards[this.state.clickedObj.pos], page);
            }
        }
        // else {
        //     // Select or deselect the clicked page, if selected show option buttons
        //     if( this.state.clickedObj.page == page.id){
        //         this.setState({ clicked:false, clickedObj:{} });
        //     }
        //     else {
        //         this.setState({ clicked:false, clickedObj:{page: page.id, level:page.level} });
        //     }
        // }
    }

    /** Function called when a PageItem is long pressed
     * Show option button for the page */
    onPageLongPress = ( page, index ) => {
        console.log("onPageLongPress", page);
        if( this.state.clickedObj.page == page.id){
            this.setState({ clicked:false, clickedObj:{} });
        }
        else {
            this.setState({ clicked:false, clickedObj:{page: page.id, level:page.level} });
        }
    }

    /** Edit the given page
     * @param page the selected page
     */
    onPageClickEdit = ( page, index ) => {
        console.log("FlowComposerScreen onPageClickEdit "+index, page);
        this.props.navigation.navigate('PageEdit', {page, index, 
            onPageEdited: ( editedPage, pageIndex, originalPage) => this.editPageFromTree(originalPage, editedPage)
        });

        // Deselect page
        this.setState({ clicked:false, clickedObj:{} });
    }

    /** Duplicate the given page
     * @param page the selected page
     */
    onPageClickCopy = (  page, index ) => {
        // console.log("FlowComposerScreen onPageClickCopy "+index, page);
        // Create a new duplicated page at the same level
        let duplicatedPage = JSON.parse(JSON.stringify(page));
        duplicatedPage.id = ObjectID.generate();
        // Remove all card links
        duplicatedPage.cards.forEach( (card, i) => {
            card.next_page_id = null;
        });
        this.props.setPageAt( duplicatedPage, this.props.tree.pages.length);

        // Deselect page
        this.setState({ clicked:false, clickedObj:{} });
    }

    /** Paste a card into the given page
     * @param page the selected page
     * @param index of the page
     * @param pasteCard card to add to the page
     */
    onPageClickPaste = (  page, index, pasteCard = null ) => {
        // console.log("FlowComposerScreen onPageClickPaste "+index, page, pasteCard);
        if( pasteCard ){
            let tempPage = JSON.parse( JSON.stringify(page));
            tempPage.cards.push( pasteCard);
            this.editPageFromTree( page, tempPage);
        }

        // Deselect page
        this.setState({ clicked:false, clickedObj:{} });
    }

    /** Delete the given page
     * @param page the selected page
     */
    onPageClickDelete = ( page, index ) => {
        // console.log("FlowComposerScreen onPageClickDelete "+index, page);
        this.props.deletePageFromTree(this.props.tree, page);

        // Deselect page
        this.setState({ clicked:false, clickedObj:{} });
    }

    /** Function called when a card inside a page is clicked
     * Show the button to add a new page */
    onCardLongPress = ( card, index, page) => {
        // console.log("FlowComposerScreen onCardLongPress "+card.id, card);
        if( this.state.clickedObj.card == card.id){
            this.setState({ clicked:false, clickedObj:{} });
            return
        }

        if( this.state.clickedObj.card != undefined){
            let parent = getLinkedPageFromPage(this.props.tree.pages, page);
            let selectedPage = this.props.tree.pages.filter((page) => {
                return page.id == this.state.clickedObj.page;
            })[0];
            if( parent ) {
                // If the page is linked by the selected card, delete the link
                if( this.state.clickedObj.page == parent.page.id && this.state.clickedObj.card == parent.card.id) {
                    this.deleteLink( selectedPage, selectedPage.cards[this.state.clickedObj.pos], page);
                }
            }
            else {
                // If this page hasn't a parent, link it to the curretly selected card
                this.createLink( selectedPage, selectedPage.cards[this.state.clickedObj.pos], page);
            }
            return
        }

        this.setState({
            clicked:true,
            clickedObj:{ page: page.id, card:card.id, pos:index, level:page.level}
        });
    }

    /** Handle link of the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickAdd = ( card, index, page ) => {
        // console.log("onCardClickAdd"+index, card)
        let destPage = null;
        if( card.next_page_id){
            // Search destination page
            let temp = this.props.tree.pages.filter((page, index) => {return page.id == card.next_page_id});
            destPage = temp && temp.length > 0 ? temp[0] : null;
        }
        // Show modal to edit link
        this.onLinkClick( page, card, destPage);
    }

    /** Edit the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickEdit = ( card, index, page ) => {
        // console.log("FlowComposerScreen onCardClickEdit "+index, card);
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
                this.editPageFromTree(page, tempPage);
            }, forceArchived: true
        });

        // Deselect card
        this.setState({ clicked:false, clickedObj:{} });
    }

    /** Duplicate the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickCopy = ( card, index, page ) => {
        // console.log("FlowComposerScreen onCardClickCopy "+index, card);
        this.props.copyCard(card);

        // Deselect card
        this.setState({ clicked:false, clickedObj:{} });
    }

    /** Delete the given card
     * @param card the selected card
     * @param {number} index the index of the selected card, this.should be the same as this.state.clickedObj.pos
     */
    onCardClickDelete = ( card, index, page ) => {
        // console.log("FlowComposerScreen onCardClickDelete "+index, card);
        let tempPage = deleteCardFromPage( card, index, page );

        if( this.editPageFromTree(page, tempPage) ){
            this.setState({clickedObj: {}});
        }
        else {
            // This should never happen
            this.props.showErrorModal(I18n.t("error.card.delete"), `Page not found in current tree\ntreeExist?: ${this.props.tree ? `length:${this.props.tree.length}`:false}; page?: ${page?page.id:false}; indexFound: ${this.props.tree.pages.indexOf(tempPage)}`);
        }
    }

    /** Save an edited page into this.props.tree */
    editPageFromTree = ( originalPage, editedPage = null ) => {
        let indexPage = this.props.tree.pages.indexOf(originalPage);
        if( indexPage >= 0){
            this.props.setPageAt( editedPage, indexPage);
            return true;
        }
        else {
            // This should never happen
            return false;
        }
    }

    /** Render a single Line between 2 pages*/
    renderLine = ( originPage, originCard, x1, y1, destPage, x2, y2) => {
        let displaceX = originCard.y_pos > 0.5 ? +2 : -2;
        return (
            <LinkLine
                onPress={() => {this.onLinkClick( originPage, originCard, destPage)}}
                key={`${originCard.id}_${destPage.id}`}
                x1={x1+displaceX} y1={y1}
                x2={x2} y2={y2} />
        );
    }

    /** Show the modal to edit the link */
    onLinkClick = ( originPage, originCard, destPage) => {
        this.setState({ showLinkCardModal: true, selectedLink: {exist: (originCard && destPage && originCard.next_page_id == destPage.id) ? true : false, originPage, originCard, destPage}});
    }

    /** Link an existing tree to the card, all all the pages of the tree
     * to the current tree */
    onLinkTree = ( originPage, originCard, destTree) => {
        if( originPage && originCard){
            let tempTree = linkCardToTree( originPage, originCard, this.props.tree, destTree.pages);
            this.props.setTree(tempTree);
        }
        else {
            // No origin page, open the given tree
            this.props.setTree(destTree);
            this.setState({ name: destTree.name || this.state.name})
        }

        // Deselect card
        this.setState({clickedObj: {}});
    }

    createLink = ( originPage, originCard, destPage) => {
        // console.log("FlowComposerScreen createLink ", originCard);
        let newTree = null;
        if( canCreateLink(this.props.tree.pages, originPage, originCard, destPage)){
            // The destination page can be linked to the card
            newTree = createLink(this.props.tree, originPage, originCard, destPage); 
        }
        // HIde the modal, then update the tree
        this.setState({showLinkCardModal: false, clicked:false, clickedObj:{}}, () => {
            if( newTree ){
                this.props.setTree(newTree);
            }
        });
    }

    deleteLink = ( originPage, originCard, destPage) => {
        // console.log("FlowComposerScreen deleteLink ", originCard);
        this.setState({showLinkCardModal: false, clicked:false, clickedObj:{}}, () => {
            let editedPage = JSON.parse(JSON.stringify(originPage));
            editedPage.cards.forEach( (card, index) => {
                if( card.id == originCard.id && card.x_pos == originCard.x_pos && card.y_pos == originCard.y_pos && card.scale == originCard.scale){
                    card.next_page_id = null;
                }
            });
            this.editPageFromTree( originPage, editedPage);
        });
    }

    getTree = () => {
        return {
            id: this.props.tree.id,
            favourite: this.props.tree.favourite,
            name: this.state.name,
            patient_id: this.props.currentPatient ? this.props.currentPatient.id : undefined,
            pages: this.props.tree.pages,
        };
    }

    /**
     * Save the current tree on the server
     */
    saveTree = () => {
        if( this.state.sendingTree ){return;}
        if( !this.props.currentPatient ){
            this.props.showErrorModal(I18n.t("error.tree.create"), I18n.t("error.patient.missing"))
            return;
        }
        let newTree = this.getTree();
        
        // Check if tree is valid
        if( this.props.checkIfTreeHasMoreRoots( newTree.pages) ){
            return;
        }
        
        // Show loading bar, since sending tree is a long operation
        this.setState({sendingTree: true, savingTree: true});
        // console.log("FlowComposer saveTree", newTree);
        if( newTree.id ){
            // Tree already has an id, so it's already on the server
            this.props.updateTree(newTree, (updatedTree) => {
                console.log("FlowComposer saveTree updatedTree", updatedTree);
                if( updatedTree ){
                    this.props.setTree( updatedTree);
                }
                this.setState({sendingTree: false,savingTree: false});
            });
        }
        else{
            newTree.id = ObjectID.generate();
            // Tree doesn't have an id, so it's not on the server
            this.props.createTree(newTree, (createdTree) => {
                // console.log("FlowComposer saveTree createdTree", createdTree);
                if( createdTree ){
                    this.props.setTree( createdTree);
                }
                this.setState({sendingTree: false, savingTree: false});
            });
        }
    }

    getHeaderTitle = () => {
        if (this.state.headerTitleOverride == null){
            return I18n.t("tree.generic");
        }
        return this.state.headerTitleOverride;
    }

    _onLeftHeaderButtonPressed = () => { this.setState({isMenuOpen: !this.state.isMenuOpen });}

    _onRightHeaderButtonPressed = () => {
        if(this.props.liveView){
            this.props.closeLiveView();
        }
        else{
            this.props.openLiveView();
        }
    }

    _onSessionEndPressed = () => {
        // Close the current session (it it is open)
        if(this.props.session.current) {
            this.props.createEvent(
                "transition_to_end_events",
                this.props.session.current, this.props.session.displayPage,
                null,
                ( createdEvent) => {
                    if( createdEvent ) {
                        this.props.newSession(null);
                        this.props.closeLiveView();
                        this.setState({headerTitleOverride: null});
                    }
                }
            );
        } 
    }

    _onNewTreePressed = () => {
        this.props.navigation.navigate('Compose')
        this.props.newTree()
    }

    _onPreviewPressed = () => {
        if( this.state.sendingTree ){return;}
        let previewTree= JSON.parse(JSON.stringify(this.getTree()));
        // Check if tree is valid
        if( this.props.checkIfTreeHasMoreRoots( previewTree.pages) ){
            return;
        }
        // Start a preview
        this.setState({sendingTree: true}, () => {
            this.props.startPreviewSession( "communication_sessions", previewTree, ( createdLoadTreeEvent ) => {
                this.setState({sendingTree: false});
                if( createdLoadTreeEvent ) {
                    this.props.openLiveView();
                    this.setState({headerTitleOverride: "Console"});
                }
            });
        }); 
    }

    _onSessionPressed = () => {
        if( this.state.sendingTree ){return;}
        let tree = JSON.parse(JSON.stringify(this.getTree()));
        // Check if tree is valid
        if( this.props.checkIfTreeHasMoreRoots( tree.pages) ){
            return;
        }
        this.setState({sendingTree: true}, () => {
            this.props.startTrainingSession( "communication_sessions", tree, ( createdLoadTreeEvent) => {
                this.setState({sendingTree: false});
                if( createdLoadTreeEvent ) {
                    this.props.openLiveView();
                    this.setState({headerTitleOverride: this.props.currentPatient.name});
                }
            });
        });
    }

    render() {
        const { navigate } = this.props.navigation;
        let tree = this.props.tree
        let emptyTree = !(tree && tree.pages && tree.pages.length > 0);
        let iconname = this.props.liveView ? 'ios-arrow-up' : 'ios-arrow-down';
        let coords = {}

        return (
            <Container theme={theme} >
            <AirettSideMenu style={baseStyles.fullPage} isOpen={this.state.isMenuOpen} navigation={this.props.navigation} onClose={ ()=> {if (this.isComponentMounted) this.setState( {isMenuOpen: false});} }>
                <AirettHeader title={this.getHeaderTitle()}
                    iconName={iconname}
                    onLeftButtonPress={this._onLeftHeaderButtonPressed}
                    onRightButtonPress={this._onRightHeaderButtonPressed} />

                <Content scrollEnabled={false} contentContainerStyle={baseStyles.fullPage} ref={(ref) => this.vert = ref}>
                    <Item >
                        <Icon style={baseStyles.buttonIcon} name={"md-create"} />
                        <TextInput style={{ flex: 1, marginVertical: 8,}}
                            keyboardType={"default"}
                            onChangeText={this.onChangeNameText}
                            value = {this.state.name}/>
                    </Item>
                    <Tree tree={this.props.tree}  onPress={() => this.setState({ clicked:false, clickedObj:{} })}
                        renderItem={this.renderItem} renderLine={this.renderLine}
                        onNewTreePress={() => { this.onLinkClick();}} />
                    {renderIf(this.props.liveView,<LiveView completedBottomBar={true} navigation={this.props.navigation}/>)}

                    <LinkCardModal link={this.state.selectedLink}
                        currentPatient={this.props.currentPatient}
                        navigation={this.props.navigation}
                        visible={this.state.showLinkCardModal}
                        isOpen={this.state.showLinkCardModal}
                        closeModal={() => { this.setState({showLinkCardModal: false});}}
                        onLinkNewPage={this.handleNewPage}
                        onLinkTree={this.onLinkTree }
                        onCreatePress={this.createLink}
                        onDeletePress={this.deleteLink}
                    />
                    <LoadingModal
                        text={this.state.savingTree ? I18n.t("tree.saving") : I18n.t("tree.sending")}
                        visible={this.state.sendingTree}
                        isOpen={this.state.sendingTree}
                    />
                </Content>


                <Footer
                    style={{backgroundColor:'transparent'}}
                >
                    <FlowComposerFooter
                        isGuest={this.props.isGuest}
                        currentSession={this.props.session.current}
                        emptyTree={emptyTree}
                        onSessionEndPress={this._onSessionEndPressed}
                        onNewPress={this._onNewTreePressed}
                        onSavePress={this.saveTree}
                        onPreviewPress={this._onPreviewPressed}
                        onSessionPress={this._onSessionPressed}
                        />
                </Footer>
            </AirettSideMenu>
        </Container>);
    }
}

/** Main Content, show the tree */
function Tree( props){
    if( props.tree && props.tree.pages && props.tree.pages.length > 0){
        return (
            <View style={[baseStyles.fullPage, {backgroundColor:"transparent"}]}>
                <TreeView list={props.tree.pages}  onPress={props.onPress}
                    renderItem={props.renderItem} renderLine={props.renderLine}/>
            </View>
        );
    }
    else {
        const buttonSize = 64;
        return (
            <View style={{flex: 1, alignItems: 'center',}}>
                <View style={{marginTop: 32}}>
                    <Button rounded style={{justifyContent: "center", width: buttonSize+7*theme.buttonPadding, height: buttonSize+7*theme.buttonPadding}} onPress={props.onNewTreePress}>
                        <Icon style={{fontSize: buttonSize}} name={"md-add"}/>
                    </Button>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        currentUser: state.authenticationReducer.currentUser,
        isGuest: state.authenticationReducer.currentUser && state.authenticationReducer.currentUser.type == "GuestUser" ? true : false,
        currentPatient: state.authenticationReducer.currentPatient,
        tree: state.webSocketReducer.tree,
        session: state.webSocketReducer.session,
        copy: state.clipboardReducer.copy,
        ip: state.webSocketReducer.ip,
        route: state.webSocketReducer.route,
        liveView: state.liveViewReducer.open
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        send: (msg) => {dispatch(send(msg))},
        newTree: () => {dispatch(newTree())},
        newPage: (pl) => {dispatch(newPage(pl))},
        newSession: (session) => {dispatch(newSession(session))},
        setTree: (tree) => {dispatch(setTree(tree))},
        setPageAt: (page, index) => {dispatch(setPageAt(page, index))},
        deletePageFromTree: (tree, page) => {dispatch(deletePageFromTree(tree, page))}, 
        createTree: (tree, callback) => {dispatch(createTree(tree, callback))},
        updateTree: (tree, callback) => {dispatch(updateTree(tree, callback))},
        startTrainingSession: (type, tree, callback) => {dispatch(startTrainingSession(type, tree, callback))},
        startPreviewSession: (type, tree, callback) => {dispatch(startPreviewSession(type, tree, callback))},
        createEvent: (eventType, session, page, body, callback) => {dispatch(createEvent(eventType, session, page, body, callback))},
        checkIfTreeHasMoreRoots: (pages) => {return checkIfTreeHasMoreRoots(pages, dispatch)},
        openLiveView: () => {dispatch(setOpen())},
        copyPage: (page) => {dispatch(copyPage(page))},
        copyCard: (card) => {dispatch(copyCard(card))},
        closeLiveView: () => {dispatch(setClose())},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowComposerScreen);
