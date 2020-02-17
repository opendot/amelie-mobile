
import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from "../../i18n/i18n";
import AirettSimpleHeader from "../../utils/airettSimpleHeader.js";
import LiveView from '../liveView/liveView.js';
import PaginatedSectionList from "../../utils/paginatedSectionList.js";
import BoxItem from "./boxItem";
import BoxDetailsModal from "./boxDetailsModal";
import { renderIf } from "../../utils/utils";

// third party
import { Container, Content, Icon } from 'native-base';
import { debounce, groupBy } from 'lodash';

// actions
import { navigateToMainScreen } from "../../utils/utils";
import { setOpen, setClose } from '../../actions/LiveViewActions';

// styles
import theme from "../../themes/base-theme";


class CognitiveEnhancementScreen extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            showBoxDetailsModal: false,
            selectedBox: {}
        }

        this.liveViewDebounce = debounce(this.onLiveViewButtonPressed, 100);
    }

    static navigationOptions = {
        header: null,
    };


    goToMainScreen = () => {
        navigateToMainScreen(this.props.navigation);
    }

    renderSeparator = () => {
        return null
    }

    renderItem = (item) => {
        return <BoxItem box={item.item} onItemPress={this.selectBox}/>
    }

    renderSectionHeader = (item) => {
        // Check if the level is available
        item.section.locked = (item.section.data.find(dataItem => dataItem.status === "available")) ? false : true
        return <BoxItemHeader headerItem={item.section} />
    }

    onDataAvailable = (responseData) => {
        return groupBy(responseData, 'level_name')
    }

    selectBox = (selectedBox) => {
        this.setState({showBoxDetailsModal: true, selectedBox: selectedBox})
    }
    
    onLiveViewButtonPressed = () => {
        (this.props.liveView) ? this.props.closeLiveView() : this.props.openLiveView();
    }

    render() {
        let iconName = this.props.liveView ? 'ios-arrow-up' : 'ios-arrow-down';
        return (
            <Container>
                
                <AirettSimpleHeader title={I18n.t("cognitive_enhancement")}
                    leftIconName={"home"}
                    onLeftButtonPress={this.goToMainScreen}
                    rightIconName={iconName}
                    onRightButtonPress={this.liveViewDebounce}
                />

                <Content contentContainerStyle={{flex: 1}}>

                    {renderIf(this.props.liveView, <LiveView completedBottomBar={true} navigation={this.props.navigation} />)}

                    <View style={styles.subtitleContainer}>
                        <Text style={styles.subtitleText}>{I18n.t("cognitive_enhancement_initial_sentence")}</Text>
                    </View>

                    <PaginatedSectionList 
                        createQuery={(page, searchFilter) => {
                            return `patients/${this.props.currentPatient.id}/available_boxes?page=${page}`;
                        }}
                        keyExtractor={(item, index) => {
                            return item.id;
                        }}
                        renderItem={this.renderItem}
                        renderSectionHeader={this.renderSectionHeader}
                        emptyListMessage={I18n.t("empty_list")}
                        onDataAvailable={this.onDataAvailable}
                    />   

                </Content>

                <BoxDetailsModal
                    visible={this.state.showBoxDetailsModal}
                    isOpen={this.state.showBoxDetailsModal}
                    closeModal={() => { this.setState({showBoxDetailsModal: false});}}
                    box={this.state.selectedBox}
                    navigation={this.props.navigation}
                />

            </Container>
        );
    }
}

function BoxItemHeader(props) {
    return(
        <View style={(props.headerItem.locked) ? [styles.levelContainer, {backgroundColor: 'grey'}] : styles.levelContainer}>
            {(props.headerItem.locked) ? <Icon name={"lock"} style={{fontSize: 20, marginRight: 10, color: "white"}}/>  : null}
            <Text style={styles.subtitleText}>{props.headerItem.title}</Text>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        currentUser: state.authenticationReducer.currentUser,
        currentPatient: state.authenticationReducer.currentPatient,
        liveView: state.liveViewReducer.open
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openLiveView: () => {dispatch(setOpen())},
        closeLiveView: () => {dispatch(setClose())}
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CognitiveEnhancementScreen);

const styles = StyleSheet.create({
    subtitleContainer: {
        backgroundColor: theme.brandPrimary,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center', 
    },
    subtitleText: {
        color: theme.inverseTextColor,
        fontSize: theme.fontSizeBase,
    },
    levelContainer: {
        flexDirection: 'row',
        backgroundColor: '#424242',
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});