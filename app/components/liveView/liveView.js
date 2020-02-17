import React from 'react';
import { AppState, View } from 'react-native';

// component
import PageItem from '../pageItem';
import GazeCursor from '../gazeCursor';
import LoadingModal from "../../utils/loadingModal";
import CompletedBottomBar from "./completedBottomBar"
import AlertBottomBar from "./alertBottomBar"
import I18n from '../../i18n/i18n';

//third party
import Dimensions from 'Dimensions';
import { connect } from 'react-redux';

// actions
import {setSocketEyeTracker, connectSocketEyeTracker, handleSocketEyeTrackerAppState, setCards, goBackHistory, addTreeToStack, removeTreeFromStack, setFlagBackShuffleEvent, gazeOn, gazeOff, alignEyetracker} from "../../actions/WSactions";
import {createEvent, createLoadTreeEvent, createBackEvent, createShuffleEvent, showAlignEyetrackerLine} from "../../actions/SessionActions";
import {setClose} from '../../actions/LiveViewActions';
import {getFavouriteTrees} from "../../actions/TreeActions";

// styles
import pageTheme from "../../themes/page-theme";

const SUBBUTTONS = {
    SOUNDS: [{label: "1", soundName: "soft"},{label: "2", soundName: "hard"},{label: "3", soundName: "harder"},],
};

class LiveView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            contentWidth: -1,
            contentHeight: -1,
            eyeData: [],// x, y coords received from the eyetracker
            listFavouriteTrees: [],
            alertNum: 0,
            selectedFavouriteIndex: 0,
            modalText: "",
            showModal: false
        }

        this.isComponentMounted = false;
        this.shuffle = this.shuffle.bind(this);
    }

    componentWillMount(){
        // console.log("LiveView componentWillMount ", this.props);
        // Start socket
        this.connectSocketEyeTracker();

        // Get favourite trees, used to quick select a tree, only if there is the relaated buttom in the bottom bar
        if(this.props.completedBottomBar)
            this.retrieveFavouriteTrees();
    }

    componentDidMount(){
        this.isComponentMounted = true;
        AppState.addEventListener('change', this.props.handleSocketEyeTrackerAppState);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.displayPage != this.props.displayPage
            && nextProps.flagBackShuffleEvent){
            this.props.setFlagBackShuffleEvent( undefined);
            this.props.createShuffleEvent( nextProps.currsession, nextProps.displayPage );
        }
    }

    componentWillUnmount(){
        this.isComponentMounted = false;
        // Stop socket
        this.props.socketEyeTracker.close();
        AppState.removeEventListener('change', this.props.handleSocketEyeTrackerAppState);
    }

    /** Get the list of favourite trees and save them in the state */
    retrieveFavouriteTrees = () => {
        this.props.getFavouriteTrees( this.props.currentPatient, null,
            ( listFavourites) => {
                if( listFavourites && this.isComponentMounted) {
                    let mappedTrees = listFavourites.map((tree, index) => {
                        let shortName = tree.name.substring(0,3);
                        if(tree.name.length > 3){
                            shortName += "..."
                        }
                        return {
                            label: shortName,
                            showLabel: true,
                            tree: tree,
                        };
                    });
                
                    this.setState({listFavouriteTrees: mappedTrees });
                }
            }
        );
    }

    /** Start the websocket, create a new one if needed */
    connectSocketEyeTracker = () => {
        this.props.connectSocketEyeTracker(this.getOnMessageListener(), false, null);
    }

    /**
     * Create the listener for the websocket,
     * the listener must be recreated to update the 'this' object
     * @returns {function} a listener for the eyetracker's messages
     */
    getOnMessageListener = () => {
        return (e) => {
            if( this.props.socketEyeTracker && this.props.socketEyeTracker.ws
                && e.currentTarget._socketId != this.props.socketEyeTracker.ws._socketId) {
                console.log(`LiveView.getOnMessageListener: message from wrong socket ${e.currentTarget._socketId} != ${this.props.socketEyeTracker.ws._socketId}`)
                return; 
            }

            const event = JSON.parse(e.data);
            switch (event.type) {
                case 'cursor':
                    if( this.isComponentMounted && event.data && event.data.length == 2) {
                        this.setState({eyeData: event.data});
                        if(this.eyetimer) clearTimeout(this.eyetimer);
                        this.eyetimer = setTimeout(()=>{this.setState({eyeData:[-1,-1]})},300)
                    }
                    break;
            }
        }
    }

    /** The user can choose a card in place of the patient */
    onCardClick = ( card, cardIndex, page) => {
        // Therapist can oly select cards in a training session (backward compatibility)
        if(this.props.completedBottomBar)
            if( this.props.cardVideoPlaying ) {
                this.interruptVideoAndChangePage();
            }
            else if(this.props.currsession){
                if( card.selectable == false) { return; }
                
                // Go to next page
                this.props.createEvent( 
                    "patient_user_choice_events",
                    this.props.currsession,
                    page, { card_id: card.id },
                    ( createdEvent ) => {
                        console.log("created PatientChoice ", createdEvent);
                    }
                );
            }
        else
            // It is not possible to click on cards during a cognitive session
            return;
    }

    /** If during a session a video is playing, interrupt the video and go to the next page */
    interruptVideoAndChangePage = () => {
        if( this.props.cardVideoPlaying ) {
            // A video is playing, force the interruption of the video and go to next page
            
            // I need the whole card, it should be inside the display page
            let card = this.props.displayPage ?
                this.props.displayPage.cards.find((c) => c.id == this.props.cardVideoPlaying)
                : null;
            if( card ) {
                // Force the interruption of the video
                this.props.createEvent( 
                    "end_video_events",
                    this.props.currsession,
                    this.props.displayPage,
                    { card_id: card.id },
                );
            }
            else {
                // ERROR, the card video is not in the current display page
                console.log("LiveView interruptVideoAndChangePage ERROR, the card video is not in the current display page "+this.props.cardVideoPlaying, this.props.displayPage)
            }
        }
    }

    shuffle() {
        this.props.createShuffleEvent( this.props.currsession, this.props.displayPage );
    }

    /** Send a BackEvent */
    sendBackEvent = () => {
        this.props.createBackEvent( this.props.currsession, this.props.displayPage, this.props.pageHistory, this.props.treeStack, this.props.treeList );
    } 

    /**
     * Add an extra tree to the current session
     * When the extra tree finish, go back to the previous tree.
     * There can be any number of extra trees, also we can go back
     * to the previous page even if it is in a finished tree
     */
    addTreeToCurrentSession = ( newTree ) => {
        if( !this.props.currsession || !newTree ) {
            return;
        }

        // Use the Load Tree event to notify a new tree
        let tempTree = JSON.parse(JSON.stringify(newTree));
        const currentDisplayPage = this.props.displayPage;
        

        this.setState({modalText: I18n.t("tree.sending"), showModal: true});

        // Add the tree to the stack
        // Do it before create the event, since the SHOW_PAGE message from the communicator may arrive sooner
        // than the response
        this.props.addTreeToStack( tempTree, currentDisplayPage);

        this.props.createLoadTreeEvent( this.props.currsession, tempTree,
            ( createdEvent) => {
                if( !createdEvent ) {
                    // Something went wrong, remove the inserted tree
                    this.props.removeTreeFromStack();
                }
                this.setState({showModal: false});
            }
        );
    }

    /** Measure width and height of the Content component to scale the page */
    onContentLayout = (evt) => {
        this.setState({
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

    _onAlertSelected = (button, index) => {this.setState({alertNum: index})}

    _onAlertPressed = () => {
        // I can send a sound alert even if there is no training session
        this.props.createEvent( 
            "sound_alert_events",
            this.props.currsession || {},
            this.props.displayPage,
            {
                sound: {
                    group: this.props.setting.sound,
                    id: SUBBUTTONS.SOUNDS[this.state.alertNum].soundName
                }
            },
            ( createdEvent ) => {
                console.log("created SoundAlert ", createdEvent);
            }
        );
    }

    // function used by alert button in the reduced botom bar
    _onAlertPressedReducedBar = (index) => {
        // I can send a sound alert even if there is no training session
        this.props.createEvent( 
            "sound_alert_events",
            this.props.currsession || {},
            this.props.displayPage,
            {
                sound: {
                    group: this.props.setting.sound,
                    id: SUBBUTTONS.SOUNDS[index].soundName
                }
            },
            ( createdEvent ) => {
                console.log("created SoundAlert ", createdEvent);
            }
        );
    }

    _onFavouriteSelected = (button, index) => {this.setState({selectedFavouriteIndex: index})}

    _onFavouritePressed = () => {
        if( this.state.listFavouriteTrees.length > 0 ) {
            this.addTreeToCurrentSession(this.state.listFavouriteTrees[this.state.selectedFavouriteIndex].tree);
        }
    }

    /** Show/hide the line to align the EyeTracker */
    onAlignEyetrackerPressed = () => {
        this.props.showAlignEyetrackerLine(!this.props.alignEyetrackerOn, ( response ) => {
            if(response) {
                this.props.alignEyetracker(!this.props.alignEyetrackerOn)
            }
        });
    }

    _onSwitchValueChange = (value) => {
        if( !this.props.currsession || !this.props.displayPage)
            return;
        this.props.createEvent( 
            value ? "eyetracker_unlock_events" : "eyetracker_lock_events",
            this.props.currsession,
            this.props.displayPage,
            null,
            () => {
                // console.log("created Gaze ", createdEvent);
                if( value )
                    this.props.gazeOn();
                else 
                    this.props.gazeOff();
            }
        );
    }

    hasAPreferredTree = () => {
        let found = false
        this.props.treeStack.forEach(element => {
            if (this.props.treeList[element.id].favourite){
                found = true;
            }
        });
        return found;
    }

    render() {
        let gwidth = Dimensions.get('window').width;
        let eyes = this.state.eyeData;

        return (
            <View style={{flex:1, position:"absolute", top:0, left:0, right: 0, zIndex: 5, elevation: 5}}>

                <View style={{
                    width:"100%",
                    height: gwidth * 0.562,
                    flexDirection: 'row',
                    backgroundColor: '#000',
                }} onLayout={this.onContentLayout}>

                    {this.props.displayPage ?
                        <PageItem page={this.props.displayPage} index={0}
                            scale={this.getPageItemScale()} xPos={0} yPos={0}
                            selectableIconEnabled={true}
                            onPageClick={this.interruptVideoAndChangePage}
                            onCardClick={this.onCardClick}/>
                        : <View style={{position:"absolute", width:2, height:2, borderRadius:10,backgroundColor:"red", top:(gwidth*0.562)/2 - 5, left:gwidth/2 - 5}}></View> }
                    <GazeCursor gazeX={eyes[0]} gazeY={eyes[1]} displayWidth={gwidth} displayHeight={gwidth*0.562} ></GazeCursor>
                </View>
                <View>
                    
                    {
                        (this.props.completedBottomBar) ?
                            <CompletedBottomBar 
                                hideBack={this.props.hideBack} hideAlert={this.props.hideAlert} hideFavourite={this.props.hideFavourite}
                                hideShuffle={this.props.hideShuffle} hideAlign={this.props.hideAlign} hideSwitch={this.props.hideSwitch}
                                currsession={this.props.currsession} displayPage={this.props.displayPage} sendBackEvent={this.sendBackEvent}
                                alertNum={this.state.alertNum} onAlertSelected={this._onAlertSelected}
                                onAlertPressed={this._onAlertPressed} navigation={this.props.navigation}
                                selectedFavouriteIndex={this.state.selectedFavouriteIndex} listFavouriteTrees={this.state.listFavouriteTrees}
                                onFavouriteSelected={this._onFavouriteSelected} onFavouritePressed={this._onFavouritePressed}
                                onSwitchValueChange={this._onSwitchValueChange} isGazeOn={this.props.isGazeOn}
                                hasAPreferredTree={this.hasAPreferredTree} shuffle={this.shuffle}
                                disableBack={!this.props.pageHistory || this.props.pageHistory.length < 1}
                                onAlignPressed={this.onAlignEyetrackerPressed}
                                SUBBUTTONS={SUBBUTTONS}
                            />
                        :
                            <AlertBottomBar
                                iconName={"ios-notifications"}
                                onPress={this._onAlertPressedReducedBar}
                                overlayOffsetY={-3}
                                currsession={this.props.currsession}
                                displayPage={this.props.displayPage}
                                onAlignPressed={this.onAlignEyetrackerPressed}
                                onSwitchValueChange={this._onSwitchValueChange}
                                isGazeOn={this.props.isGazeOn}
                            />
                    }

                </View>
                <LoadingModal
                    text={this.state.modalText}
                    visible={this.state.showModal}
                    isOpen={this.state.showModal}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        serverUrl: state.authenticationReducer.serverUrl,
        socketEyeTracker: state.webSocketReducer.socketEyeTracker,
        displayPage: state.webSocketReducer.session.displayPage,
        currentPatient: state.authenticationReducer.currentPatient,
        pageHistory: state.webSocketReducer.session.pageHistory,
        treeStack: state.webSocketReducer.session.treeStack,
        treeList: state.webSocketReducer.session.treeList,
        cardVideoPlaying: state.webSocketReducer.session.cardVideoPlaying,
        flagBackShuffleEvent: state.webSocketReducer.session.flagBackShuffleEvent,
        isGazeOn: state.webSocketReducer.gazeOn,
        alignEyetrackerOn: state.webSocketReducer.alignEyetrackerOn,
        currsession: state.webSocketReducer.session.current,
        setting: state.settingReducer,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSocketEyeTracker: (socket) => {dispatch(setSocketEyeTracker(socket))},
        connectSocketEyeTracker: (onMessageListener, reconnectOnError, firstMessage) => {dispatch(connectSocketEyeTracker(onMessageListener, reconnectOnError, firstMessage))},
        handleSocketEyeTrackerAppState: (currentAppState) => {dispatch(handleSocketEyeTrackerAppState(currentAppState))},
        setCards: (arr) => {dispatch(setCards(arr))},
        createEvent: (eventType, session, page, body, callback) => {dispatch(createEvent(eventType, session, page, body, callback))},
        goBackHistory: (amount) => {dispatch(goBackHistory(amount))},
        addTreeToStack: ( tree, prevTreeCurrentPage) => {dispatch(addTreeToStack( tree, prevTreeCurrentPage))},
        removeTreeFromStack: (amount) => {dispatch(removeTreeFromStack(amount))},
        setFlagBackShuffleEvent: (flag) => {dispatch(setFlagBackShuffleEvent(flag))},
        closeLiveView: () => {dispatch(setClose())},
        getFavouriteTrees: (patient, searchText, callback) => {dispatch(getFavouriteTrees(patient, searchText, callback))},
        createLoadTreeEvent: (session, tree, callback) => {dispatch(createLoadTreeEvent(session, tree, callback))},
        createBackEvent: (session, displayPage, pageHistory, treeStack, treeList, callback) => {dispatch(createBackEvent(session, displayPage, pageHistory, treeStack, treeList, callback))},
        createShuffleEvent: (session, displayPage, callback) => {dispatch(createShuffleEvent(session, displayPage, callback))},
        showAlignEyetrackerLine: (show, callback) => {dispatch(showAlignEyetrackerLine(show, callback))},
        gazeOn: () => {dispatch(gazeOn())},
        gazeOff: () => {dispatch(gazeOff())},
        alignEyetracker: (show) => {dispatch(alignEyetracker(show))}
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(LiveView);