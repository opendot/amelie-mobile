import React from 'react';
import { View, TouchableOpacity, StyleSheet, Keyboard, KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import { connect } from 'react-redux';

// component
import {renderIf} from "../../utils/utils";
import I18n from '../../i18n/i18n';
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import PaginatedFlatList from "../../utils/paginatedFlatList";
import LiveView from "../liveView/liveView";
import TreeListItem from "./treeListItem";
import PageListItem from "./pageListItem";
import CardListItem from "./cardListItem";

// third party
import { Container, Content, Tabs, TabHeading, Tab, Text, Button, Icon, Grid, Col } from 'native-base';
import ObjectID from "bson-objectid";// Generate a unique Hex String of 24 characters (12 bytes https://docs.mongodb.com/manual/reference/bson-types/#objectid)
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { getTree, createTree, updateTree, deleteTree } from "../../actions/TreeActions";
import { deleteCard } from "../../actions/CardActions";
import { setTree } from "../../actions/WSactions";
import {setOpen, setClose} from '../../actions/LiveViewActions';
import {showErrorModal} from '../../actions/ModalAction';
import { navigateToFlowComposerScreen } from "../../utils/utils";

// styles
import theme, { baseStyles } from '../../themes/base-theme'

/** 
 * Screen used to search Trees, Pages and Cards belonging to the user/patient
 * @param patient used to search objects related to the patient
 */
class UserLibraryScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props)

        this.state = {
            isMenuOpen: false,
            isSearching: false,
            searchedText: ""
        }

        this.isComponentMounted = false;
    }

    componentDidMount() {
        this.isComponentMounted = true;
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    renderTreeItem = ( { item, index, separators} ) => {
        return (
            <TreeListItem 
                tree={item} index={index}
                onTreePress={debounce( this.onTreePress, 1000, {leading: true, trailing: false})}
                onTreeLeftPress={this.onTreeFavouritePress}
                onTreeDuplicatePress={this.onTreeDuplicatePress}
                onTreeRightPress={this.onTreeDeletePress}
                />
        );
    };

    /** Set the tree as current tree, so you can edit it */
    onTreePress = ( tree, index) => {
        this.props.getTree( tree.id, ( tree ) => {
            this.props.setTree( tree );
            navigateToFlowComposerScreen(this.props.navigation);
        });
    }

    /** Set the tree as a Favourite */
    onTreeFavouritePress = ( tree, index) => {
        // console.log("onPageFavouritePress "+index, tree);
        tree.favourite = !tree.favourite;
        this.props.updateTree( tree, (updatedTree) => {
            // Update the element on the list
            // this.treeList.tryResetList();
            this.treeList.updateListItem(updatedTree, index);
        });
    }

    /** Duplicate the tree on server */
    onTreeDuplicatePress = ( tree, index) => {
        // console.log("onTreeDuplicatePress "+index, tree);
        this.props.getTree( tree.id, ( treeFromServer ) => {
            if (treeFromServer) {
                let cloneTree = JSON.parse(JSON.stringify(treeFromServer));
                cloneTree.id = ObjectID.generate();
                // cloneTree.patient_id = this.props.currentPatient.id;
                this.props.createTree( cloneTree, ( createdTree ) => {
                    // Reset the list
                    this.treeList.tryResetList();
                });
            }
            else {
                this.props.showErrorModal(null, I18n.t("error.tree.get"));
            }
        });
    }

    /** Delete the tree from server */
    onTreeDeletePress = ( tree, index) => {
        // console.log("onPageDeletePress "+index, tree);
        this.props.deleteTree( tree, ( {success} ) => {
            // Reset the list
            this.treeList.tryResetList();
        });
    }

    renderPageItem = ( { item, index, separators} ) => {
        return (
            <PageListItem 
                page={item} index={index}
                />
        );
    };

    renderCardItem = ({ item, index, separators}) => {
        return (
            <CardListItem 
                card={item} index={index}
                onCardRightPress={item.type == "CustomCard" ? this.onCardDeletePress : null}
                />
        );
    }

    /** Delete custom card from server */
    onCardDeletePress = ( card, index) => {
        // console.log("onCardDeletePress "+index, card);
        this.props.deleteCard( card, ( {success} ) => {
            // Reset the list
            this.cardList.tryResetList();
        });
    }

    renderSeparator = () => {
      return (
        <View
          style={{
            flex: 1,
            height: 2,
            backgroundColor: '#616265'
          }}
        />
      );
    };

    onNewCardPressed = debounce(() => {
        Keyboard.dismiss();
        this.props.navigation.navigate("cardBuilder", {onCardCreated: this._performSearchDebounce});
    }, 1000, {leading: true, trailing: false});

    onSearchPressed = debounce(() => {
        if(this.state.isSearching) {
            Keyboard.dismiss();
        }
        this.setState({isSearching: !this.state.isSearching})
    }, 300, {leading: true, trailing: false});

    onSearchClosePressed = debounce(()=>{
        this.setState({isSearching: false, searchedText: ""}, this._performSearch)
    }, 300, {leading: true, trailing: false});

    _textInputAdded = (component) => {
        this._textInput = component
        if (this._textInput != null) {
            this._textInput.focus();
        }
    }

    _performSearch = () => {
        if (this.cardList != null) {
            this.cardList.tryResetList();
        }
        if (this.treeList != null) {
            this.treeList.tryResetList();
        }
    }

    _performSearchDebounce = debounce(this._performSearch, 250, {leading: false, trailing: true});

    render() {
        let iconname = this.props.liveView ? 'ios-arrow-up' : 'ios-arrow-down';
        let patient = this.props.navigation.state.params ? this.props.navigation.state.params.patient : null;
        return (
            <Container theme={theme}>
                <AirettSimpleHeader hasTabs title={I18n.t("user.library")}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={() => this.props.navigation.goBack()}
                    rightIconName={iconname}
                    onRightButtonPress={() => {
                        if(this.props.liveView){
                            this.props.closeLiveView();
                        }
                        else{
                            this.props.openLiveView();
                        }
                    }} />
                <Content contentContainerStyle={baseStyles.fullPage}>
                    <View style={{backgroundColor: theme.tabDefaultBg, flexDirection: 'row'}}>
                        <Button iconLeft bordered light={Platform.OS=="android"} dark={Platform.OS=="ios"}
                                style={{backgroundColor: 'transparent', margin: 5, marginLeft: 15}}
                                onPress={this.onNewCardPressed}>
                            <Icon name='ios-add' />
                            <Text>{I18n.t("card.newCard")}</Text>
                        </Button>
                        <View style={{flex: 1}}/>
                        <Button icon bordered light={Platform.OS=="android"} dark={Platform.OS=="ios"}
                                style={[{backgroundColor: 'transparent', margin: 5, marginRight: 15}, , {backgroundColor: this.state.isSearching?theme.brandPrimary:'transparent'}]}
                                onPress={this.onSearchPressed}>
                            <Icon name='ios-search' />
                        </Button>
                    </View>
                    <Tabs locked >
                        <Tab heading={ <TabHeading><Text>{I18n.t("tree.generics")}</Text></TabHeading>}>
                            {renderIf(!this.props.liveView && this.state.searchedText.length > 0 && !this.state.isSearching, <SearchedTextLabel text={this.state.searchedText} onPress={this.onSearchClosePressed}/>)}
                            <PaginatedFlatList 
                                ref={(list) => {this.treeList = list;}}
                                createQuery={( page, searchFilter) => {
                                    return `custom_trees?${patient ? `patient_id=${patient.id}&` : ``}page=${page}${this.state.searchedText.length > 0 ? `&query=${this.state.searchedText}` : ''}`;
                                }}
                                keyExtractor={ ( tree, index) => tree.id }
                                renderItem={this.renderTreeItem }
                                emptyListMessage={I18n.t("empty_list")}
                                ItemSeparatorComponent={this.renderSeparator}
                                />
                        </Tab>
                        <Tab heading={ <TabHeading><Text>{I18n.t("card.generics")}</Text></TabHeading>}>
                            {renderIf(!this.props.liveView && this.state.searchedText.length > 0 && !this.state.isSearching, <SearchedTextLabel text={this.state.searchedText} onPress={this.onSearchClosePressed}/>)}
                            <PaginatedFlatList 
                                ref={(list) => {this.cardList = list;}}
                                createQuery={( page, searchFilter) => {
                                    return `cards?${patient ? `patient_query=${patient.id}&` : ``}page=${page}${this.state.searchedText.length > 0 ? `&tag_query=${this.state.searchedText}` : ''}`;
                                }}
                                keyExtractor={ ( card, index) => card.id }
                                renderItem={this.renderCardItem }
                                emptyListMessage={I18n.t("empty_list")}
                                ItemSeparatorComponent={this.renderSeparator}
                                />
                        </Tab>
                    </Tabs>
                    {renderIf(this.props.liveView,<LiveView/>)}
                    {renderIf(this.state.isSearching,
                    <KeyboardAvoidingView style={styles.textField}>
                        <Grid>
                            <Col><TextInput
                                ref = {this._textInputAdded}
                                style={{width:'100%',backgroundColor:'#fff',height: 40, borderColor: 'transparent', borderWidth: 0, marginBottom:10}}
                                onChangeText={(text) => {
                                    this.setState({searchedText: text}, this._performSearchDebounce);
                                }}
                                onSubmitEditing={this.onSearchPressed}
                                value={this.state.searchedText}
                            />
                            </Col>
                            <Col style={{ width: 65 }}>
                                <TouchableOpacity onPress={this.onSearchPressed} style={{backgroundColor: theme.brandPrimary, margin:4, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center'}}>
                                    <Icon style={{ fontSize:20, color:"white"}} name={"md-checkmark"}/>
                                </TouchableOpacity>
                            </Col>
                        </Grid>
                    </KeyboardAvoidingView>)}
                </Content>
            </Container>
        );
    }
}

function SearchedTextLabel(props) {
    return(
        <View style={styles.searchLabelContainer}>
            <Text style={styles.searchedText}>{props.text}</Text>
            <Button transparent
                    style={{margin: 5, marginRight: 15}}
                    onPress={props.onPress}>
                <Icon name='md-close' />
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    textField: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:"white",
        borderColor: 'grey',
        borderWidth: 1
    },
    searchLabelContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderColor: 'grey',
        alignItems: 'center',
        borderWidth: 1
    },
    searchedText: {
        margin: 15,
        marginRight: 0,
        flex: 1,
        fontWeight: 'bold',
        color: theme.brandPrimary
    }
});

const mapStateToProps = (state) => {
    return {
        currentUser: state.authenticationReducer.currentUser,
        currentPatient: state.authenticationReducer.currentPatient,
        liveView: state.liveViewReducer.open,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getTree: (tree, callback) => {dispatch(getTree(tree, callback))},
        createTree: (tree, callback) => {dispatch(createTree(tree, callback))},
        updateTree: (tree, callback) => {dispatch(updateTree(tree, callback))},
        deleteTree: (tree, callback) => {dispatch(deleteTree(tree, callback))},
        deleteCard: (card, callback) => {dispatch(deleteCard(card, callback))},
        setTree: (tree) => {dispatch(setTree(tree))},
        openLiveView: () => {dispatch(setOpen())},
        closeLiveView: () => {dispatch(setClose())},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserLibraryScreen);