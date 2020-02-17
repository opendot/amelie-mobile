import React, { Component } from 'react';
import { StyleSheet, View, BackHandler, } from 'react-native';

// third party libraries
import { connect } from 'react-redux';
import { Container, Content, Text, Thumbnail, Button } from 'native-base';
import { NavigationActions } from 'react-navigation';
import { debounce } from 'lodash'; // Prevent double clicks

// actions
import { changeRoute } from "../../actions/SessionActions";

// styles
import theme from "../../themes/base-theme";

// import custom components
import I18n from '../../i18n/i18n';
import ActivitySelectorFooter from './activitySelectorFooter';
import ActivitySelectorHeader from './activitySelectorHeader';
import ExitConfirmationModal from "../../utils/exitConfirmationModal";

// custom application actions
import { doSignout, startServerSync } from "../../actions/AuthenticationActions";

// constants definition
const iconSize = 200;
const iconWidth = 100;
const activities = [
    {
        id: 0,
        label: 'comunicator',
        icon: require('../../../images/ico_communicator.png'),
        targetScreen: 'flowComposer'
    },
    {
        id: 1,
        label: 'games',
        icon: require('../../../images/ico_games.png'),
        targetScreen: 'GameList'
    },
    {
        id: 2,
        label: 'cognitive_enhancement',
        icon: require('../../../images/ico_cognitive.png'),
        targetScreen: 'CognitiveEnhancement'
    },
    {
        id: 3,
        label: 'calibration',
        icon: require('../../../images/ico_calibration.png'),
        targetScreen: 'EyetrackerCalibration'
    }
];

function ActivityItem(props) {

    // Advise client to change route if activity is CognitiveEnancement/flowComposer
    if (props.targetScreen === "CognitiveEnhancement")
        onPressFunc = props.changeRouteCognitive
    else if (props.targetScreen === "flowComposer" || props.targetScreen === 'EyetrackerCalibration')
        onPressFunc = () => props.changeRouteCards(props.targetScreen)
    else
        onPressFunc = () => props.navigation.navigate(props.targetScreen)

    onPressFuncDebounce = debounce(onPressFunc, 500, {leading: true, trailing: false});

    return (
        <Button transparent style={styles.activityContainer} onPress={onPressFuncDebounce}>
            <View style={styles.activityIcon}>
                <Thumbnail square size={props.iconSize} source={props.iconUri}/>
            </View>
            <View style={styles.activityLabel}>
                <Text style={styles.textStyle}> { I18n.t(props.text) } </Text>
            </View>
        </Button>
    );
}


class ActivitySelector extends Component {

    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props)

        let a = JSON.parse( JSON.stringify(activities) );
        if( this.props.isGuest ){
            // Guest can't use Cognitive enhancement
            a = a.filter(activity => activity.label != "cognitive_enhancement");
        }

        this.state = {
            activities: a,
            showExitConfirmModal: false
        }
    }

    /** Manage the hardware back button, if it is pressed in this page show confirmation modal to exit from the application */
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPressed);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed);
    }

    /** Function to pass at the header when settings button is pressed */
    navigateToSettings = () => this.props.navigation.navigate('Settings');

    /** Function for the sync button on the footer, it is passed to the footer functional component */
    syncButtonFunc = () => this.props.startServerSync(this.props.currentPatient);

    /** Function for the sync button on the footer, it is passed to the footer functional component */
    disconnectButtonFunc = () => {
        this.props.doSignout( () => {
            // Go to signin page
            this.props.navigation.dispatch(
                NavigationActions.reset({
                    index: 0,
                    actions: [ NavigationActions.navigate({ routeName: 'Home'}) ]
                })
            );
        });
    };

    /** Function for the CognitiveEnhancement activity, advise server that client has to change route */
    changeClientRouteToCognitive = () => {
        this.props.changeRoute('cognitive',
            (response) => {
                //console.log("ActivitySelectorScreen.changeRoute response", response)
                if (response.success) this.props.navigation.navigate('CognitiveEnhancement')
            }
        );
    }

    /** Function for the flowComposer activity, advise server that client has to change route */
    changeClientRouteToCards = (targetScreen = 'flowComposer') => {
        this.props.changeRoute('cards',
            (response) => {
                //console.log("ActivitySelectorScreen.changeRoute response", response)
                if (response.success) this.props.navigation.navigate(targetScreen)
            }
        );
    }

    /** Prevent closing app when clicking on back button */
    onBackPressed = () => {
        // Ask confirmation to exit
        if( this.props.navigation.state.key == this.props.route ){
            // Only in the page ActivitySelectorScreen (this page) prevent back and show modal to close the app
            // I don't know why, but inside this.props.navigation.state there is always this page,
            // by changing page its values don't change
            this.setState({showExitConfirmModal: true});
            return true;
        }
        else {
            return false;
        }
    }

    render() {
        return (
            <Container>

                <ActivitySelectorHeader
                    navigateToSettings={this.navigateToSettings}
                />

                <Content contentContainerStyle={{flex: 1, minHeight: 4*80, backgroundColor: theme.brandPrimary}}>

                    { this.state.activities.map((item) =>
                        <ActivityItem key={item.id} iconSize={iconSize} iconUri={item.icon}
                                    text={item.label} navigation={this.props.navigation} targetScreen={item.targetScreen}
                                    changeRouteCognitive={this.changeClientRouteToCognitive}
                                    changeRouteCards={this.changeClientRouteToCards}
                        />
                    )}

                <ExitConfirmationModal
                    visible={this.state.showExitConfirmModal}
                    isOpen={this.state.showExitConfirmModal}
                    closeModal={() => { this.setState({showExitConfirmModal: false});}}
                />

                </Content>

                <ActivitySelectorFooter
                    isGuest={this.props.isGuest}
                    disconnectFunc={this.disconnectButtonFunc}
                    syncFunc={this.syncButtonFunc} />

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    activityContainer: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 80,
        paddingLeft: 0,
    },
    activityIcon: {
        width: iconWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityLabel: {
        flex: 1,
        justifyContent: 'center',
    },
    textStyle: {
        color: theme.inverseTextColor,
        fontSize: theme.fontSizeBase
    }
});

const mapStateToProps = (state) => {
    return {
        currentUser: state.authenticationReducer.currentUser,
        isGuest: state.authenticationReducer.currentUser && state.authenticationReducer.currentUser.type == "GuestUser" ? true : false,
        currentPatient: state.authenticationReducer.currentPatient,
        route: state.webSocketReducer.route,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        doSignout: (callback) => dispatch(doSignout(callback)),
        startServerSync: (patient) => dispatch(startServerSync(patient)),
        changeRoute: (targetRoute, callback) => dispatch(changeRoute(targetRoute, callback))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySelector);
