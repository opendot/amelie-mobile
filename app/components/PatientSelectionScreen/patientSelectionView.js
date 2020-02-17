import React from 'react';
import { FlatList } from 'react-native';

// component
import I18n from '../../i18n/i18n';
import PaginatedFlatList from "../../utils/paginatedFlatList";
import PatientButtonItem from "./patientButtonItem";
 

/**
 * Show a list of patients
 * @param {?any} currentUser the current logged user, used to obtain only patients of this user
 * @param {?any[]} patients the array of elements to show, if not defined it get the list from the server
 * @param {function} onPatientClick called when user click on a Patient
 */
export default function PatientSelectionView( props ){
    let _renderSimplePatientItem = ( { item, index, separators} ) => {
        return (
            <PatientButtonItem 
                selected={item.id === props.selectedPatientId}
                patient={item} index={index}
                onPatientPress={props.onPatientClick}
                />
        );
    };

    if( props.patients ){
        // Show the list of given patients
        return (
            <FlatList
                data={props.patients}
                keyExtractor={ _keyExtractor }
                renderItem={_renderSimplePatientItem }
                emptyListMessage={I18n.t("empty_list")}
                />
        );
    }
    else {
        // Retrieve list of patients from server
        return (
            <PaginatedFlatList 
                createQuery={( page, searchFilter) => {
                    if( props.currentUser ){
                        // TODO Show only patients for that user
                        return `patients?page=${page}`
                    }
                    else {
                        // Show all patients
                        return `patients?page=${page}`;
                    }
                }}
                keyExtractor={ _keyExtractor }
                renderItem={_renderSimplePatientItem }
                emptyListMessage={I18n.t("empty_list")}
                />
        );
    }
}

/** Use the patient id as key */
function _keyExtractor( patient, index){
    return patient.id;
}