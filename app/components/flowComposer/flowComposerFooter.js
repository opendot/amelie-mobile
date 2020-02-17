import React from 'react';

// components
import I18n from '../../i18n/i18n';
import IconButton from '../../utils/iconButton';

// third party
import { Body, Button, Text } from 'native-base';

/** 
 * Footer of the FlowComposerScreen, shows the buttons to edit a Tree
 * or a button to close the session
 * @param {Session} currentSession the current active session, show the Exit button if defined
 */
export default function FlowComposerFooter( props ) {
    if( props.currentSession ) {
        // Show a red button for session, and a green button for preview
        const isPreview = props.currentSession.id.startsWith("preview_");
        return (
            <Body>
                <Button full success={isPreview} danger={!isPreview} onPress={props.onSessionEndPress} >
                    <Text>{I18n.t(isPreview ? "session.exitPreview" : "exit").toUpperCase()}</Text>
                </Button>
            </Body>
        );
    }
    else {
        return (
            <Body
                style={{justifyContent:'center'}}
            >

                <IconButton iconName={"ios-document"}
                    debounce={true}
                    onPress={props.onNewPress} />
                <IconButton iconName={"ios-share"}
                    disabled={props.emptyTree}
                    debounce={true}
                    onPress={props.onSavePress} />
                <IconButton iconName={"ios-eye"}
                    disabled={props.emptyTree}
                    debounce={true}
                    onPress={props.onPreviewPress} />
                <IconButton iconName={"ios-exit"}
                    hide={props.isGuest}
                    disabled={props.emptyTree}
                    debounce={true}
                    onPress={props.onSessionPress} />

            </Body>
        );
    }
}