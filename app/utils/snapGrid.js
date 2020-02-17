import React from 'react';
import { StyleSheet } from 'react-native';

// third party
import { Col, Row, Grid } from 'react-native-easy-grid';

/** Grid overlayed above the screen */
export default class SnapGrid extends React.Component {
    
    constructor( props ){
        super( props);

        this.state = {
            rows: [],
            columns: [],
        };

    }

    componentDidMount() {
        this.calculateLines();
    }

    calculateLines = ( numRows = 10, numColumns = 17 ) => {
        let rows = [];
        let columns = [];

        for( let i = 0; i < numRows; i++) {
            rows.push({id: i});
        }
        for( let i = 0; i < numColumns; i++) {
            columns.push({id: i});
        }

        this.setState({rows, columns});
    }

    renderRowItem = ( item, index ) => {
        return (
            <Row key={`row_${item.id}`}
                style={[styles.lineBase, { borderTopWidth: item.id == 0 ? 0 : 1 }]}
                />
        );
    }

    renderColItem = ( item, index ) => {
        return (
            <Col key={`col_${item.id}`}
                style={[styles.lineBase, { borderLeftWidth: item.id == 0 ? 0 : 1 }]}
                />
        );
    }

    render() {
        if ( this.props.hide ) { return null; }

        // Use pointerEcents none to ingore all touches
        return (
            <Grid pointerEvents="none">
                <Grid style={styles.lineContainer} >
                    {this.state.rows.map(this.renderRowItem)}
                </Grid>
                <Grid style={styles.lineContainer} >
                    {this.state.columns.map(this.renderColItem)}
                </Grid>
            </Grid>
        );
    }
}

const styles = StyleSheet.create({
    lineContainer: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    lineBase: {
        borderColor: "gray",
        opacity: 0.5,
        backgroundColor: "transparent",
    },
});