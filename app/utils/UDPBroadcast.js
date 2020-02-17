import React from 'react';

// third party
import {createSocket} from "react-native-udp";

/** 
 * Send an UDP broadcast message to find all local server in the network
 * WARNING on some android devise like SM-A310F the broadcast doesn't work, also
 * it cause problems to qr code scanner.
 * See https://github.com/tradle/react-native-udp/issues/50#issuecomment-432147732
 */
export default class UDPBroadcast extends React.Component {

    componentDidMount() {
        this.isComponentMounted = true;
        this.startUDPSocketBroadcast();
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
        if( this.udpSocket ) {
            this.udpSocket.close();
        }
    }

    // only works for 8-bit chars
    toByteArray(message) {
        var uint = new Uint8Array(message.length);
        for (var i = 0, l = message.length; i < l; i++){
            uint[i] = message.charCodeAt(i);
        }

        return new Uint8Array(uint);
    }

    isLoopEnabled = () => {
        if( this.props.loop != undefined && this.props.loop != null ) {
            return this.props.loop;
        }
        else {
            return true;
        }
    }

    fromByteArray(messageAscii) {
        return String.fromCharCode.apply(String, messageAscii)
    }

    startUDPSocketBroadcast = () => {
        // console.log('UDPBroadcast startUDPSocketBroadcast');
        this.udpSocket = createSocket("udp4")

        /* Send an UDP broadcast message */
        this.udpSocket.once('listening', () => {
            // set the socket as as a Broadcast
            this.udpSocket.setBroadcast(true);

            this.sendBroadcast();
        })

        /* Receive a response message from all local server in the network */
        this.udpSocket.on('message', (msgAscii, rinfo) => {
            // console.log('startUDPSocketBroadcast. message was received', msgAscii, rinfo);
            const message = this.fromByteArray(msgAscii);
            // console.log('startSocketBroadcast. decoded', message);

            if( message === "Airett Local Server") {
                if( this.props.onLocalServerFound ) {
                    this.props.onLocalServerFound(rinfo)
                }

            }
        })

        this.udpSocket.on( "error", (error) => {
            console.log("UDPBroadcast ERROR", error);
        })

        /* Open the socket */
        this.udpSocket.bind(4002);
    }

    /** Send a broadcast UDP message */
    sendBroadcast = () => {
        let buf = this.toByteArray("Airett Mobile App");
        this.udpSocket.send(buf, 0, buf.length, 4001, "255.255.255.255", (error) => {
            if (error) {
                console.log("sendBroadcast ERROR", error);
            }

            // console.log("sendBroadcast message was sent");
            if( this.isLoopEnabled() && this.isComponentMounted ) {
                // Keep sending broadcast messages every second
                setTimeout( () => {
                    this.sendBroadcast();
                }, 5000);
            }
        });
    }

    render() {
        return null;
    }
}
