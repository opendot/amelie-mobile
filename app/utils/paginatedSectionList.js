import React, {Component} from 'react';
import {View, Text, SectionList, StyleSheet, TouchableOpacity} from 'react-native';

// components
import I18n from "../i18n/i18n";

// actions
import {fetchFromServer} from "./utils";
import {showErrorModal, openLoginModal} from '../actions/ModalAction';

// third party
import { connect } from 'react-redux';
import { debounce, keys, uniqBy } from 'lodash';


/**
 * Show a list, all paginated with an infinite scroll.
 * The list is retrieved with a query to the given url
 * @param {function} createQuery return the path used for ask the elements to the server
 * @param {string} emptyListMessage a message to display when a list is empty and is not in loading state
 * @param {function} renderItem function that renders a single row
 * @param {function} keyExtractor function that allow to define a property of the item as the key
 * @param {function} onDataAvailable function that will be called whenever the represented data changes. The function will receive an array containing the data and is expected to return it, edited if needed.
 * 
 * NOTE: if onDataAvailable removes some element, there is the possibility that the list reaches the end of the scroll and causes a new request to the server for the next page.
 * Once obtained the new page, the process repeates. So it's possible that all the pages get requested one after another.
 */
class PaginatedSectionList extends Component {

    constructor(props){
        super(props);

        this.state={
            list: [],
            loadingList: false,
            searchFilter: '',
        }

        // Used for pagination
        this.lastRequestedPage = 0;
        this.numberOfPages = 1;

        this.isComponentMounted = false;

        this.tryDownloadNewElementsDebounce = debounce(this.tryDownloadNewElements, 1000, {leading: true, trailing: false});
    }

    componentDidMount() {
        this.isComponentMounted = true;

        // Init the lists, use tryReset to prevent multiple calls to the server
        this.tryResetList();
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    /** Download new elements if it's not already downloading */
    tryDownloadNewElements = () => {
        // Don't update if I'm not the visible page
        if( !this.isComponentMounted ){ return;}

        if( !this.state.loadingList ){
            // I'm not downloading, so start the update
            this.setState( {loadingList: true}, () => this.getOtherElements() );
        }
    }

    /** Reset the list if it's not already downloading */
    tryResetList = () => {
        // Don't update if I'm not the visible page
        if( !this.isComponentMounted ){ return;}

        if( !this.state.loadingList ){
            // I'm not downloading, so start the update
            this.setState( {loadingList: true}, () => this.resetList() );
        }
    }

    /** Request elements from the server
     * The download will always happen, you should use tryDownloadNewElements to prevent multiple calls to the server */
    getOtherElements = () => {
        // console.log("PaginatedSectionList getOtherElements page:"+this.lastRequestedPage+"++");
        this.lastRequestedPage++;
        let query = this.props.createQuery(this.lastRequestedPage, this.state.searchFilter);
        fetchFromServer(
            this.props.serverUrl,
            query,
            'get',
            {},
            null,
            this.props.signinCredentials
        ).then(response => {
            //console.log(`PaginatedSectionList getOtherElements()`, response);
            if(!this.isComponentMounted) return;
            if (response.status < 300) {
                this.numberOfPages = Math.ceil(parseInt(response.headers.total) / parseInt(response.headers["per-page"]));

                // Allow modification of data coming from the server before add it to the component local state
                let editedData = this.letDataBeEdited(response.data);
                updatedData = this.mergeData(editedData)

                // Signal that the download is over
                this.setState({list: updatedData, loadingList: false});
            }
            else {
                if (response.status == 401) {
                    this.props.openLoginModal(() => {
                        this.tryResetList();
                    });
                    this.setState({loadingList: false});
                    return;
                }
                // console.log("PaginatedFlatList getOtherElements: can't get data", response);
                // Signal that the download is over
                this.setState({loadingList: false});

                // Show modal with error
                this.props.showErrorModal( null, 
                    response.data && response.data.errors ? 
                    response.data.errors.length > 0 ? response.data.errors[0] : JSON.stringify(response.data.errors)
                    : JSON.stringify(response)
                );
            }
        }).catch(error => {
            console.log("Error fetching elements: ", error);
            // Signal that the download is over
            this.setState({loadingList: false});

            // Show modal with error
            this.props.showErrorModal( null, error.message);
        });
    }

    /** Allow to edit the data outside of this component */
    letDataBeEdited = (data) => {
        if (this.props.onDataAvailable) {
            return this.props.onDataAvailable(data) || data;
        }
        return data;
    }

    /** Tells if there are more data available on the server */
    hasMoreElements = ( ) => {
        //if (this.lastRequestedPage === this.numberOfPages) console.log("kkkkkkkkkkkkkkk GOT ALL ELEMENTS kkkkkkkkkkkkkkkkk")
        return this.lastRequestedPage < this.numberOfPages;
    }

    /** Clear all values, then download the new data.
     * The download will always happen, you should use tryResetList to prevent multiple calls to the server */
    resetList = () => {
        this.setState({
            list: [],
            loadingList: true,
        }, () => {
            this.numberOfPages = 1;
            this.lastRequestedPage = 0;
            this.getOtherElements();
        })
    }

    /** Save the given item at the given index of the list
     * Do nothing if list is loading or index is not valid */
    updateListItem = (updatedItem, index) => {
        if( !this.state.loadingList && index >= 0 && index < this.state.list.length){
            let tempList = this.state.list.slice(0);
            tempList[index] = updatedItem;
            this.setState({list: tempList});
        }
    }

    /** Function to merge component data and modified data */
    mergeData = (newData) => {
        let newKeys = keys(newData)
        
        let newList = []
        newList.push(...this.state.list)
        
        newKeys.map((key) => {
            if (section = newList.find(item => item.title === key)) {
                // Section exists, add data
                section.data.push(...newData[key])
                section.data = uniqBy(section.data, 'box_id')
            } else {
                // Section doesn't exist, create the new section and add data
                newList.push({'title':  key, 'data': newData[key]})  
            }
        })
        return newList
    }

    render(){
        if (!this.state.loadingList && (!this.state.list || this.state.list.length === 0)) {
            return(
                <TouchableOpacity style={styles.tabContainer}
                    onPress={this.tryResetList}  >
                    <Text style={{marginHorizontal: 16}}>
                        {this.props.emptyListMessage || I18n.t("empty_list")}
                    </Text>
                    <LoadingBar loading={this.state.loadingList} />
                </TouchableOpacity>
            );
        }

        return(
            <View style={styles.tabContainer} >
                <SectionList
                    style={this.props.style}
                    sections={this.state.list}
                    renderSectionHeader={this.props.renderSectionHeader}
                    renderItem={this.props.renderItem}
                    keyExtractor={this.props.keyExtractor}
                    ItemSeparatorComponent={this.props.ItemSeparatorComponent}
                    onEndReachedThreshold={0.75}
                    keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
                    onEndReached={() => {
                        // Prevent onEndReached when the list is empty
                        if( this.state.list.length > 0 && this.hasMoreElements()){
                            // Download next 
                            this.tryDownloadNewElementsDebounce();
                        }
                    }}
                    refreshing={this.state.loadingList}
                    onRefresh={this.tryResetList}
                />
                <LoadingBar loading={this.state.loadingList} />
            </View>
        );
    }

    /** Reset the list and add a text as a search.
     * The rerender will cause to ask the server only the elements to match the search */
    onSearch(event,text){
        // At least 3 letters to perform a search.
        if (text.length >= 3 ){
            this.setState({searchFilter: text, list: [], loadingList: true}
                ,() => {
                    this.lastRequestedPage = 0;
                    this.getOtherElements();
            });
        }
    }

}

function LoadingBar(props){
    if( props.loading ){
        return (<View style={styles.loadingBar} >
            <Text >{I18n.t("loading")}</Text>
        </View>);
    }
    else {
        return null;
    }
}

const styles = StyleSheet.create({
    tabContainer: {
        flex: 1,
    },
    loadingBar : {
        flex: 1,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 6,
    },
});

function mapStateToProps(state) {
    return {
        serverUrl: state.authenticationReducer.serverUrl,
        signinCredentials: state.authenticationReducer.signinCredentials,
    }
}

function mapDispatchToProps (dispatch) {
    return {
        showErrorModal: (title, text) => dispatch(showErrorModal(title, text)),
        openLoginModal: (nextAction) => dispatch(openLoginModal(nextAction)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(PaginatedSectionList);
