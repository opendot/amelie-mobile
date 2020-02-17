const SOURCE ={
    GALLERY: "GALLERY",
    RECORDER: "RECORDER",
    COMPUTER: "COMPUTER",
}

/** A single file, this is usually used for the Content of the cards */
export default class File {

    /**
     * 
     * @param {any} id id of the file, usually is almost identical to the name
     * @param {string} name 
     * @param {string} mime type of the file, in the form "image/jpeg"
     * @param {File?} thumbnail 
     */
    constructor ( id, name, mime, path = null, url = null, thumbnail = null) {
        this.id = id;
        this.name = name;
        this.mime = mime;
        this.path = path,
        this.url = url;
        this.thumbnail = thumbnail;
        this.source = null;
        this.size = null;
        this.base64Data = null;
    }
    
    static get SOURCE() {
        return SOURCE;
    }
    
    /** Create an object with the same properties of this object */
    clone () {
        let clone = new File( this.id, this.name, this.mime, this.path, this.url, (this.thumbnail ? this.thumbnail.clone() : null));
        clone.setSource(this.source);
        clone.setSize(this.size);
        clone.setBase64Data(this.base64Data);
        return clone;
    }
    getId () {
        return this.id;
    }

    getName () {
        return this.name;
    }

    getMime () {
        return this.mime;
    }
    
    /** 
     * Obtain the type of the file
     * @returns {string} image, audio, video, ...
     */
    getType () {
        return this.mime ? this.mime.split("/")[0] : null;
    }

    /** @returns {string} The path of the file in the local storage of the device */
    getPath () {
        return this.path;
    }

    /** @returns {string} The path of the file in the local storage of the device */
    getUrl () {
        return this.url;
    }

    getThumbnail () {
        return this.thumbnail;
    }

    /**
     * @returns {string} the source that generated this file
     */
    getSource () {
        return this.source;
    }

    /**
     * @returns {number} the file dimension in byte
     */
    getSize () {
        return this.size;
    }

    /**
     * @returns {string} the base 64 string, without the mime at start
     */
    getBase64Data () {
        return this.base64Data;
    }

    setId ( id ) {
        this.id = id;
    }

    setName ( name ) {
        this.name = name;
    }

    setPath ( path ) {
        this.path = path;
    }

    setUrl ( url ) {
        this.url = url;
    }

    setThumbnail ( thumbnail ) {
        this.thumbnail = thumbnail
    }

    setSource ( source ) {
        if(!source) {
            this.source = null;
            return;
        }
        switch (source.toUpperCase()) {
            case SOURCE.COMPUTER:
                this.source = SOURCE.COMPUTER;
                break;
            case SOURCE.GALLERY:
                this.source = SOURCE.GALLERY;
                break;
            case SOURCE.RECORDER:
                this.source = SOURCE.RECORDER;
                break;
        }
    }

    setSize ( size ) {
        this.size = size;
    }

    setBase64Data ( base64Data ) {
        this.base64Data = base64Data;
    }
}   