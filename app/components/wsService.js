/**
 * Object used to handle a Socket connection
 */
class WSService {

    /**
     *
     * @param {string} ip address used to contact the server
     * @param {any} firstMessage first message sent after onOpen event
     * @param {boolean} reconnectOnError true if the socket must try to reconnect on error
     */
    constructor(ip, firstMessage, onMessage, reconnectOnError = true) {
        this.ip = ip;
        this.firstMessage = firstMessage;
        this.subscribedChannel = null;
        this.onMessage = onMessage;
        this.reconnectOnError = reconnectOnError;
        this.createWebSocket();
    }

    /** Create a new websocket, close the previous if exist */
    createWebSocket = ( onMessageListener = null) => {
        // console.log("WSService createWebSocket "+(this.ws ? this.ws.readyState: null), this);
        if( this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            // This should happen only when sockets are closed and opened too fast
            return;
        }

        if (this.ws) {
            // Close the previous socket with reason 1012:Service Restart
            this.close(1012);
            this.logout();// For some reason this.close() doesn't close the socket, while this.logout() works
        }
        if( onMessageListener ){
            this.onMessage = onMessageListener;
        }
        this.ws = new WebSocket('ws://' + this.ip)

        this.ws.onopen = this.onOpen;
        this.ws.onmessage = this.onMessage;

        this.ws.onerror = this.onError;
        this.ws.onclose = this.logout // function implemented elsewhere
    }

    onOpen = (arg) => {
        console.log("WSService onOpen", arg);

        // Send the first message if defined
        if (this.firstMessage) {
            this.send(this.firstMessage);
        }
    }

    onError = (e) => {
        console.log('WSService onError', e);
        this.close(1006);
        if (this.reconnectOnError) {
            this.createWebSocket();
        }
    }

    logout(e = {}) {
        // connection closed
        console.log('onclose', e.code, e.reason)
        this.close();
    }

    send(obj = {}) {
        // console.log('send readyState'+this.ws.readyState, obj, this.ws)
        if (this.ws) {
            if( this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(obj))
            }
            else {
                // This should happen only when sockets are closed and opened too fast
            }
        }
    }

    /** Close the socket */
    close(code, reason) {
        if (this.ws) {
            this.ws.close(code, reason);
            this.ws = null;
            this.subscribedChannel = null;
        }
    }

    /** @returns {boolean} true if the socket is currently closed */
    isClosed() {
        return this.ws == null || this.ws.readyState != 1;
    }

}
export default WSService
