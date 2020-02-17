/**
 * This handle most of the logic of the menù.
 * SideMenu: allow to show the menu
 * Menu: the graphic of the menu
 * MenuList: the list of buttons of the menu
 * ListItem: a single row of the list
 */

import React, { Component } from 'react'
import { View, Text, TouchableHighlight, StyleSheet } from 'react-native'

// component
import I18n from '../i18n/i18n';

// third party
import Drawer from 'react-native-drawer';// Handle the animation of the menù
import { connect } from 'react-redux';
import { debounce } from 'lodash'; // Prevent double clicks
import { NavigationActions } from 'react-navigation';
import { Thumbnail, Icon } from 'native-base';

// actions
import { doSignout, startServerSync } from "../actions/AuthenticationActions";
import { navigateToMainScreen } from "../utils/utils";

// styles
import theme, { baseStyles } from "../themes/base-theme";

/** Duration of the menu animation in millis */
const TWEEN_DURATION = 250;


/**
 * This is the Wrapper of the Menu. Allow to show the menu
 * with a Swipe gesture from left to right.
 * By using the isOpen you can open the tab. For now the name is confusing:
 * the menù will open if the value of isOpen change, THE VALUE OF isOpen IS MEANINGLESS. This is due to the library react-native-sidebar
 */
class AirettSideMenu extends Component {

    constructor( props){
        super(props);
    }

    openMenu = () => {
        this.sideBar.open();
    }

    closeMenu = () => {
        this.sideBar.close();
    }

    render() {
        let openMenuOffset = 280.0;
        const drawerStyles = {
            drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3,},
            main: {paddingLeft: 3},
        }

        return ( 
        <Drawer
                ref={(sideBar) => { this.sideBar = sideBar; }} 
				content={ <Menu navigation={this.props.navigation} currentUser={this.props.currentUser} isGuest={this.props.isGuest} currentPatient={this.props.currentPatient}
                    open={this.openMenu} close={this.closeMenu} doSignout={this.props.doSignout} startServerSync={this.props.startServerSync} />}
                type="overlay"
                open={this.props.isOpen}
                tapToClose={true}
                openDrawerOffset={0.2} // 20% gap on the right side of drawer
                panCloseMask={0.2}
                closedDrawerOffset={-3}
                elevation={5}
                onClose={this.props.onClose}
                tweenDuration={TWEEN_DURATION}
                tweenHandler={(ratio) => ({
                    mainOverlay: { opacity:(ratio)/2, backgroundColor: "black", elevation: 4}
                })}
				style={drawerStyles}>
                {this.props.children}
		</Drawer>)
    }
}

/**
 * This components contains the graphic and the logic of the menù.
 */
class Menu extends Component {

    signoutUser = () => {
        this.props.close();
        setTimeout( ()=> {// Use a timeout to allow the menu to close

            this.props.doSignout( () => {
                // Go to signin page
                this.props.navigation.dispatch( NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Home'})
                    ]
                }));
            }); 

        }, TWEEN_DURATION);
    }

    /**
     * A single function to handle all clicks, to prevent 
     * double clicks and click
     * on 2 buttons at the same time.
     */
    navigateDebounce = debounce((routeName, params) => {
        this.props.close();
        setTimeout( ()=> {// Use a timeout to allow the menu to close
            this.props.navigation.navigate(routeName, params);
        }, TWEEN_DURATION);

    }, 1000, {leading: true, trailing: false})

    render() {
        return (
            <View style={styles.container}
                >
                <UserAvatar user={this.props.currentUser} />
                <MenuList style={styles.menuCenter} currentPatient={this.props.currentPatient} navigate={this.navigateDebounce}
                    navigation={this.props.navigation}
                    isGuest={this.props.isGuest}
                    startServerSync={this.props.startServerSync}
                    />

                <View style={styles.menuFooter} >
                    <CustomListItem icon={"log-out"} borderBottomWidth={0}
                        text={I18n.t("signout")}
                        onPress={ this.signoutUser } />
                </View>

            </View>
        );
    }
}

/** A square area that show the user avatar and name */
function UserAvatar( props ) {
    if( !props.user ){
        return (
            <View style={styles.userAvatarContainer} >
                <Icon name={"md-contact"} style={{ color: "white", fontSize: 80}} />
            </View>
        );
    }
    return (
        <View style={styles.userAvatarContainer} >
            { props.user.avatar ? 
                <Thumbnail large source={{uri: props.user.avatar}} />
                : <Icon name={"md-contact"} style={{ color: "white", fontSize: 80}} />
            }
            <Text style={{color: "white"}}>{props.user.name}</Text>
        </View>
    );
}

/**
 * Central part of the menù, contains most of the clickable items and handle the buttons.
 */
class MenuList extends Component {
    render() {
        return (
            <View style={this.props.style}>
                <CustomListItem
                    icon={"home"} backgroundColor={theme.brandPrimary}
                    text={I18n.t("home")}
                    onPress={ () => navigateToMainScreen(this.props.navigation) }/>
                <CustomListItem
                    hide={this.props.isGuest}
                    icon={"md-happy"} backgroundColor={theme.brandPrimary}
                    text={I18n.t("patient.generic")} value={this.props.currentPatient ? this.props.currentPatient.name : undefined}
                    onPress={ () => this.props.navigate("PatientSelection") }/>
                <CustomListItem
                    icon={"md-albums"}
                    text={I18n.t("user.library")} 
                    onPress={ () => this.props.navigate("UserLibrary", {patient: this.props.currentPatient}) }/>
            </View>
        );
    }
}

/**
 * Single line of the menù, contains the graphic and prevent text from exit
 */
function CustomListItem( props ) {
    if(props.hide) { return null; }
    let iconSize = 24;
    return (
        <TouchableHighlight style={[baseStyles.listItem, { backgroundColor: props.backgroundColor, borderBottomWidth: props.borderBottomWidth != null ? props.borderBottomWidth : theme.borderWidth, borderColor: theme.listBorderColor}]}
            onPress={props.onPress}>
            <View style={{flex: 1, flexDirection: "row", alignItems: "center" }}>
                <Icon name={props.icon}
                    style={[ styles.icon, { width: iconSize, fontSize: iconSize, }]}
                    />
                <Text style={{flex: 1, fontSize: theme.fontSizeBase, color: "white", marginLeft: 5}} ellipsizeMode={"tail"} numberOfLines={2}>
                    {props.text}</Text>
                {props.value ? <Text style={{width: 56, fontSize: theme.btnTextSizeSmall, textAlign: "right", color: "white", marginLeft: 5}} ellipsizeMode={"tail"} numberOfLines={1}>
                    {props.value}</Text>
                : null}
                <Icon name={"md-arrow-forward"}
                    style={[ styles.icon, {width: iconSize, fontSize: iconSize,}]}
                    />
            </View>
        </TouchableHighlight>
    );

}

const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: '#424242',
    },
    menu : {
        flex: 1,
    },
    menuHeader : {
        height: 215,
        maxHeight: 215,
        padding: 12,
        backgroundColor: "cyan",
        justifyContent: "center",
        alignItems: "center"
    },
    menuCenter : {
        flex: 1,
        justifyContent: "flex-start"
    },
    menuFooter : {
        height: 60,
        justifyContent: "flex-start"
    },
    userAvatarContainer: {
        height: 160,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.brandPrimary,
        borderBottomWidth: theme.borderWidth,
        borderColor: theme.listBorderColor
    },
    image : {
        width: 108,
        height: 108,
        marginVertical: 8
    },
    icon: {
        width: 28,
        color: "white",
        fontSize: 24,
        margin: 4,
        textAlign: "center",
    },
})

const mapStateToProps = (state) => {
    return {
        currentUser: state.authenticationReducer.currentUser,
        isGuest: state.authenticationReducer.currentUser && state.authenticationReducer.currentUser.type == "GuestUser" ? true : false,
        currentPatient: state.authenticationReducer.currentPatient,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        doSignout: (callback) => dispatch(doSignout(callback)),
        startServerSync: (patient) => dispatch(startServerSync(patient)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AirettSideMenu);