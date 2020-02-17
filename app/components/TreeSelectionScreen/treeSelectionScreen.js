import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

// component
import {renderIf} from "../../utils/utils";
import I18n from '../../i18n/i18n';
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import TreeView from "../treeView";
import PageItem from "../pageItem";
import LinkLine from "../../utils/linkLine";
import SimpleButtonsRow from "../../utils/simpleButtonsRow";
import PaginatedFlatList from "../../utils/paginatedFlatList";
import LiveView from "../liveView/liveView";
import TreeListItem from "../UserLibraryScreen/treeListItem";

// third party
import { Container, Content } from 'native-base';
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { getTree, updateTree, deleteTree } from "../../actions/TreeActions";
import {setOpen, setClose} from '../../actions/LiveViewActions';
import {showErrorModal} from '../../actions/ModalAction';

// styles
import theme, { baseStyles } from '../../themes/base-theme'

/** 
 * Screen used to search and select a tree
 * @param patient used to search objects related to the patient
 * @param {function} onTreeSelected called when a tree is selected
 */
class TreeSelectionScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor( props ){
        super(props);

        this.state = {
            selectedTree: null,
        };
    }

    /* Show selected Tree */

    /** Render a single page */
    renderItem = ( item, index, xPos, yPos, scale = 1.0) => {
        return (
            <PageItem page={item} pageIndex={index}
                key={`${index}_${item.id}`}
                xPos={xPos}
                yPos={yPos}
                scale={scale} />
        );
    }

    /** Render a single Line between 2 pages*/
    renderLine = ( originPage, originCard, x1, y1, destPage, x2, y2) => {
        return (
            <LinkLine
                key={`${originCard.id}_${destPage.id}`}
                x1={x1} y1={y1}
                x2={x2} y2={y2} />
        );
    }

    /* List of Trees */
    renderTreeItem = ( { item, index, separators} ) => {
        return (
            <TreeListItem 
                tree={item} index={index}
                onTreePress={debounce( this.onTreePress, 1000, {leading: true, trailing: false})}
                onTreeLeftPress={this.onTreeFavouritePress}
                onTreeRightPress={this.onTreeDeletePress}
                />
        );
    };

    /* List separator */
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


    /** Set the tree as current tree, so you can watch it */
    onTreePress = ( tree, index) => {
        this.props.getTree( tree.id, ( completeTree ) => {
            this.setState({selectedTree: completeTree});
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

    /** Delete the tree from server */
    onTreeDeletePress = ( tree, index) => {
        this.props.deleteTree( tree, ( {success} ) => {
            // Reset the list
            this.treeList.tryResetList();
        });
    }

    /**
     * Return the selected tree
     */
    onConfirmPressed = () => {
        if( this.props.navigation.state.params.onTreeSelected ){
            this.props.navigation.state.params.onTreeSelected(this.state.selectedTree);
        }
        this.props.navigation.goBack();
    }

    render() {
        let iconname = this.props.liveView ? 'ios-arrow-up' : 'ios-arrow-down';
        let patient = this.props.navigation.state.params ? this.props.navigation.state.params.patient : null;
        return (
            <Container theme={theme}>
                <AirettSimpleHeader title={this.state.selectedTree ? I18n.t("preview") : I18n.t("tree.insert")}
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
                <Content contentContainerStyle={[baseStyles.fullPage, {backgroundColor: this.state.selectedTree ? "#6d6e71" : null}]}>
                    { this.state.selectedTree ? 
                    <TreeView list={this.state.selectedTree.pages} 
                        renderItem={this.renderItem} renderLine={this.renderLine}/>
                        :
                    <PaginatedFlatList 
                        ref={(list) => {this.treeList = list;}}
                        createQuery={( page, searchFilter) => {
                            return `custom_trees?${patient ? `patient_id=${patient.id}&` : ``}page=${page}`;
                        }}
                        keyExtractor={ ( tree, index) => tree.id }
                        renderItem={this.renderTreeItem }
                        emptyListMessage={I18n.t("empty_list")}
                        ItemSeparatorComponent={this.renderSeparator}
                        />
                    }

                    {renderIf(this.props.liveView,<LiveView/>)}

                    {this.state.selectedTree ?
                        <SimpleButtonsRow 
                            debounceOpen={true}
                            onConfirmPressed={this.onConfirmPressed}
                            debounceClose={true}
                            onClosePressed={() => this.setState({selectedTree: null})}/>
                    : null}
                </Content>
            </Container>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        currentUser: state.authenticationReducer.currentUser,
        liveView: state.liveViewReducer.open,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getTree: (tree, callback) => {dispatch(getTree(tree, callback))},
        updateTree: (tree, callback) => {dispatch(updateTree(tree, callback))},
        deleteTree: (tree, callback) => {dispatch(deleteTree(tree, callback))},
        openLiveView: () => {dispatch(setOpen())},
        closeLiveView: () => {dispatch(setClose())},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeSelectionScreen);