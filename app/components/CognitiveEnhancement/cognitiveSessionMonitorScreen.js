import React, { Component } from 'react';
import { StyleSheet, View, Text, BackHandler } from 'react-native';
import { connect } from 'react-redux';

// third party
import { Container, Content, Footer, Body, Button } from 'native-base';
import Dimensions from 'Dimensions';
import { debounce } from 'lodash'; // Prevent double clicks

// component
import I18n from "../../i18n/i18n";
import AirettSimpleHeader from "../../utils/airettSimpleHeader.js";
import LiveView from '../liveView/liveView.js';
import SessionResultModal from "./sessionResultModal";
import { navigateToCognitiveEnhancementScreen } from "../../utils/utils";
import { newSession } from '../../actions/WSactions';

// actions
import { setClose } from '../../actions/LiveViewActions';
import { createEvent } from "../../actions/SessionActions";
import getCognitiveSessionResults from "../../actions/CognitiveSessionActions";

// styles
import theme from "../../themes/base-theme";

class CognitiveSessionMonitorScreen extends Component {
    
    static navigationOptions = {
        header: null,
    };
    
    constructor(props) {
        super(props);
        this.state = {
            interruptedSession: false,
            showSessionResultModal: false,
            sessionResults: {}
        }
        this.isComponentMounted = false;
        this.onExitPressDebounce = debounce(this.onSessionEndPress, 500, {leading: true, trailing: false});  
    }

    componentWillMount() {
        // Close live Views in the application, if any, in order to optimize memory avoiding multiple setState in all liveViews
        this.props.closeLiveView()
    }


    componentDidMount() {
        this.isComponentMounted = true;
        // handles the hardware back button, same behavior as the exit button
        BackHandler.addEventListener('hardwareBackPress', this.onSessionEndPress);
    }

    componentWillUnmount() {
        this.isComponentMounted = false
        BackHandler.removeEventListener('hardwareBackPress', this.onSessionEndPress);
    }

    componentWillUpdate(nextProps, nextState){

        // A cognitive session was terminated (this.props.session.current has changed!)
        if((!nextProps.session.current && this.props.session.current)) {
            // Is the cognitive session terminated by therapist or concluded by the patient?
            if(this.state.interruptedSession) {
                // Navigate back to the list of boxes, without showing results (reset the navigator state)
                navigateToCognitiveEnhancementScreen(this.props.navigation)
            } else {
                // Perform the network call and then show the congnitive session results modal
                this.props.getCognitiveSessionResults('cognitive_sessions', this.props.session.current,
                    // Callback
                    (response) => {
                        //console.log("CognitiveSessionMonitor.getCognitiveSessionResults response", response)
                        if(this.isComponentMounted)
                            this.setState({showSessionResultModal: true, sessionResults: response})
                    }
                );
            }
        }
    }

    onSessionEndPress = () => {
        // Close the current session (it it is open)
        if(this.props.session.current) {
            this.props.createEvent(
                "transition_to_end_events",
                this.props.session.current, this.props.session.displayPage,
                null,
                (createdEvent) => {
                    if(createdEvent) {
                        // reset the current session, in the componentWillUpdate nextProps.currentsession will be null
                        // This means that the cognitive session is interrupted by the therapist
                        if(this.isComponentMounted)
                            this.setState({interruptedSession: true}, () => this.props.newSession(null))
                    }
                }
            );
        } 
    }

    render() {
        let gwidth = Dimensions.get('window').width;
        let currentBox = this.props.navigation.state.params ? this.props.navigation.state.params.box : "NO-PARAM";
        return(
            <Container>
                
                <AirettSimpleHeader leftIconName={"menu"}/>

                <Content contentContainerStyle={{flex: 1, backgroundColor: "lightgrey"}}>
                    <LiveView navigation={this.props.navigation} />

                    <View style={{position: "absolute", top: 0.75*gwidth, left: 0, width: "100%", paddingHorizontal: 15}}>
                        <Text style={styles.infoText}>{I18n.t("box")} {currentBox.box_name}</Text>
                        <Text style={styles.infoText}>{I18n.t("target")} {currentBox.current_target_name}</Text>  
                        <Text style={styles.infoText}>{I18n.t("test")} {currentBox.current_exercise_tree_name}</Text>  
                    </View>
                    
                </Content>
                <Footer>
                    <Body>
                        <Button full danger onPress={this.onSessionEndPress}>
                            <Text style={styles.buttonText}>{I18n.t("exit")}</Text>  
                        </Button>
                    </Body>
                </Footer>

                <SessionResultModal
                    visible={this.state.showSessionResultModal}
                    isOpen={this.state.showSessionResultModal}
                    sessionResults={this.state.sessionResults}
                    navigation={this.props.navigation}
                />

            </Container>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        session: state.webSocketReducer.session,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeLiveView: () => {dispatch(setClose())},
        createEvent: (eventType, session, page, body, callback) => {dispatch(createEvent(eventType, session, page, body, callback))},
        newSession: (session) => {dispatch(newSession(session))},
        getCognitiveSessionResults: (type, session, callback) => {dispatch(getCognitiveSessionResults(type, session, callback))}
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CognitiveSessionMonitorScreen);


const styles = StyleSheet.create({
    buttonText: {
        color: theme.inverseTextColor,
        fontSize: theme.fontSizeBase + 2, 
    },
    infoText: {
        color: "black",
        fontSize: theme.fontSizeBase,
        marginBottom: 5
    },
});