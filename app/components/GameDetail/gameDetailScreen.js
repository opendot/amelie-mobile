import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";

// component
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import LiveView from "../liveView/liveView";
import GameDifficultyLabel from "./gameDifficultyLabel"
import I18n from "../../i18n/i18n";

// third party
import { ActionSheet, Button, Container, Content, Footer, H3, Icon, Right, Text } from "native-base";
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { startGame, stopGame } from "../../actions/GameActions";
import {setOpen, setClose} from '../../actions/LiveViewActions';
import { showErrorModal } from "../../actions/ModalAction";
import { renderIf } from '../../utils/utils';

// styles
import theme, { baseStyles } from "../../themes/base-theme"
import SettingItem from "../Settings/settingItem";

const MIN_FIXATION_TIME = 500;
const MAX_FIXATION_TIME = 4000;
const FIXATION_TIME_STEP = 50;

const GAME_LEVEL_ACTIONSHEET = {
    BUTTONS: [ I18n.t("game.level.l1"), I18n.t("game.level.l2"), I18n.t("game.level.l3"), I18n.t("game.level.l4"), I18n.t("game.level.l5"), I18n.t("undo")],
    DESTRUCTIVE_INDEX: -1,
    CANCEL_INDEX: 5,
};

/**
 * Screen used to show a game and start it.
 */
class GameDetailScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor( props ) {
        super(props);

        // Check if this game is active
        const gameActive = this.props.currentGame && this.props.currentGame.name == this.props.navigation.state.params.game.name

        this.state = {
            started: gameActive ? true : false,
            loading: false,
            level: gameActive ? this.props.currentGame.level : 1,
            fixingTime:600
        };

        this.onStartPressDebounce = debounce(this.onStartPress, 2000, {leading: true, trailing: false});
    }

    updateFixingTime = (value) => {
        this.setState({fixingTime: value})
    }


    getImageWall = () => {
        switch (this.props.navigation.state.params.game.name) {
            case "bubbles":
                return require("../../../images/games/bubbles_wall.png");
            case "eggs":
                return require("../../../images/games/eggs_wall.png");
            case "stars":
                return require("../../../images/games/stars_wall.png");
            case "sheeps":
                return require("../../../images/games/sheeps_wall.png");
            default:
                return null;
        }
    }

    onLevelButtonPressed = () =>{
        ActionSheet.show(
        {
            options: GAME_LEVEL_ACTIONSHEET.BUTTONS,
            cancelButtonIndex: GAME_LEVEL_ACTIONSHEET.CANCEL_INDEX,
            destructiveButtonIndex: GAME_LEVEL_ACTIONSHEET.DESTRUCTIVE_INDEX,
            title: I18n.t("level"),
        },
        buttonIndex => {
            if( buttonIndex>= 0 && buttonIndex < 5) {
                this.onValueChangeLevel(buttonIndex+1);
            }
        });
    }

    onValueChangeLevel = ( levelValue, levelIndex) => {
        this.setState({level: levelValue});
    }

    /** Start or stop the current game */
    onStartPress = () => {
        const currentlyStarted = this.state.started;
        const callback = (response) => {
            if(response) {
                this.setState({started: !currentlyStarted});
            }
            this.setState({loading: false});
        };

        this.setState({loading: true}, () => {
            if(currentlyStarted) {
                this.props.stopGame( this.props.navigation.state.params.game, callback);
                this.props.closeLiveView()
            }
            else {
                this.props.startGame( this.props.navigation.state.params.game, this.state.level, this.state.fixingTime, callback);
                this.props.openLiveView();
            }
        });
    }

    render() {
        const game = this.props.navigation.state.params.game
        const rightIconName = this.props.liveView ? 'ios-arrow-up' : 'ios-arrow-down';
        return (
            <Container theme={theme}>

                <AirettSimpleHeader title={I18n.t(`game.${game.name}`)}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={() => this.props.navigation.goBack()}
                    rightIconName={rightIconName}
                    onRightButtonPress={() => {
                        if(this.props.liveView){
                            this.props.closeLiveView();
                        }
                        else{
                            this.props.openLiveView();
                        }
                    }}
                />

                <Content scrollEnabled contentContainerStyle={styles.mainContainer} >

                    <Image style={styles.image} resizeMode={"contain"}
                        source={this.getImageWall()} />

                    <View style={styles.gameContainer}>
                        <View style={styles.titleContainer}>
                            <H3>{I18n.t(`game.${game.name}`)}</H3>
                            <GameDifficultyLabel difficulty={game.difficulty}/>
                        </View>

                        <LevelPicker level={this.state.level} show={game.level}
                            onValueChangeLevel={this.onValueChangeLevel}
                            onPress={this.onLevelButtonPressed}
                            />
                        { game.fixationSelector &&  <SettingItem
                                title={I18n.t("fixing_time_edit")}
                                value={this.state.fixingTime}
                                minValue={MIN_FIXATION_TIME}
                                maxValue={MAX_FIXATION_TIME}
                                step={FIXATION_TIME_STEP}
                                containerStyle={{marginBottom:10}}
                                textStyle={{color:theme.brandSidebar}}
                                updateValueFunc={this.updateFixingTime}
                            />}
                    </View>

                    {renderIf(this.props.liveView,
                        <LiveView
                            navigation={this.props.navigation}
                            />
                    )}
                </Content>

                <Footer style={styles.footer}>
                    <StartGameButton started={this.state.started}
                        onPress={this.onStartPress}/>
                </Footer>

            </Container>
        );
    }
}

function LevelPicker( props ) {
    if( !props.show) { return null;}

    return (
        <View style={styles.picker}>
            <Button transparent full dark style={{backgroundColor: "white", justifyContent: "flex-start"}}
                onPress={props.onPress}
            >
                <Text>{GAME_LEVEL_ACTIONSHEET.BUTTONS[props.level-1]}</Text>
                <Right><Icon style={{fontSize: theme.iconSizeSmall}} name={"ios-arrow-down"} /></Right>
            </Button>
        </View>
    );
}

function StartGameButton(props) {
    return (
        <Button block large iconLeft onPress={props.onPress}>
            <Icon name={props.started ? "md-square" : "play"} />
            <H3 style={styles.startButtonText}>{I18n.t(props.started ? "exit" : "game.start")}</H3>
        </Button>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        alignItems: "stretch",
        paddingVertical: 12,
    },
    gameContainer: {
        paddingHorizontal: 12,
    },
    image: {
        flex: 1,
        alignSelf: "center",
        height: 256,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    picker: {
        width: 120,
        height: 50,
        marginBottom: 2,
    },
    startButtonText: {
        width: 64,
        color: theme.inverseTextColor,
        textAlign: "center",
    },
    footer: {
        height: null,
        flexDirection: "column",
        backgroundColor: "transparent",
        paddingHorizontal: theme.contentPadding,
        paddingBottom: theme.contentPadding
    },
});

const mapStateToProps = (state) => {
    return {
        currentPatient: state.authenticationReducer.currentPatient,
        currentGame: state.gameReducer.game,
        liveView: state.liveViewReducer.open,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        startGame: (game, level, fixingTime, callback) => { dispatch(startGame(game, level, fixingTime, callback)) },
        stopGame: (game, callback) => { dispatch(stopGame(game, callback)) },
        openLiveView: () => {dispatch(setOpen())},
        closeLiveView: () => {dispatch(setClose())},
        showErrorModal: (title, text) => { dispatch(showErrorModal(title, text)) },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameDetailScreen);
