import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { connect } from "react-redux";

// component
import AirettHeader from "../Composer/airettHeader";
import AirettSideMenu from "../airettSideMenu";
import AirettSimpleHeader from "../../utils/airettSimpleHeader.js";
import GameDifficultyLabel from "../GameDetail/gameDifficultyLabel"
import I18n from "../../i18n/i18n";

// third party
import { Container, Content, H3, ListItem, Text, Thumbnail, Left, Body } from "native-base";
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { showErrorModal } from "../../actions/ModalAction";

// styles
import theme, { baseStyles } from "../../themes/base-theme"
import { gameStyles } from "../../themes/game-theme";
import {navigateToMainScreen} from "../../utils/utils";

const games = [
    {
        name: "bubbles",
        difficulty: "easy",
        level: false,
        fixationSelector: false,
    },
    {
        name: "stars",
        difficulty: "easy",
        level: true,
        fixationSelector: false,
    },
    {
        name: "eggs",
        difficulty: "medium",
        level: true,
        fixationSelector: true,
    },{
        name: "sheeps",
        difficulty: "medium",
        level: true,
        fixationSelector: false,
    },
]

/** 
 * Screen used to select a game.
 */
class GameListScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            isMenuOpen: false,
        };

        this.onGamePressDebounce = debounce(this.onGamePress, 500, {leading: true, trailing: false});
    }
    
    onLeftHeaderButtonPressed = () => { this.setState({isMenuOpen: !this.state.isMenuOpen });}

    goToMainScreen = () => {
        navigateToMainScreen(this.props.navigation);
    }


    gameKeyExtractor = ( item, index) => {
        return item.name;
    }

    renderGameListItem = ( {item} ) => {
        return (
            <GameListItem name={item.name}
                level={item.level} difficulty={item.difficulty}
                onPress={(event) => this.onGamePressDebounce(item)}
                />
        );

    }

    /** Open the GameDetail page */
    onGamePress = ( game ) => {
        this.props.navigation.navigate( "GameDetail", {game: game});
    }

    render() {
        return (
            <Container theme={theme}>
                <AirettSimpleHeader title={I18n.t("games")}
                                    leftIconName={"home"}
                                    onLeftButtonPress={this.goToMainScreen}
                />

                    <Content contentContainerStyle={baseStyles.fullPage}>
                        <FlatList
                            data={games}
                            keyExtractor={this.gameKeyExtractor}
                            renderItem={this.renderGameListItem}
                            />
                    </Content>


            </Container>
        );
    }
}

function GameListItem( props ) {
    return (
        <ListItem thumbnail itemDivider
            style={{backgroundColor: "transparent"}}
            onPress={props.onPress}>
            <Left>
                <Thumbnail square source={props.icon || require('../../../images/ico_games.png')}/>
            </Left>
            <Body>
                <H3>{I18n.t(`game.${props.name}`)}</H3>
                <GameDifficultyLabel difficulty={props.difficulty} />
            </Body>
        </ListItem>
    );
}

const mapStateToProps = (state) => {
    return {
        currentPatient: state.authenticationReducer.currentPatient,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameListScreen);