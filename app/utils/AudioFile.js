import File from "./File";
import I18n from "../i18n/i18n";

/** An audio file */
export default class AudioFile extends File {
 
    constructor ( id, name, mime, duration = null, path, url, thumbnail = null) {
        super(id, name, mime, path, url, thumbnail);
        this.duration = duration;
    }

    static createFromFileObject (file) {
        if( file instanceof File ) {
            let newAudio = new AudioFile(file.id, file.name, file.mime, null, file.path, file.url, file.thumbnail);
            newAudio.setSource(file.getSource());
            newAudio.setSize(file.getSize());
            newAudio.setBase64Data(file.getBase64Data());
            return newAudio;
        }
        else {
            return null;
        }
    }

    /**
     * Create an audio starting from a file saved into the
     * personal_files folder
     * @param {any} audio
     * @param {string} audio.id
     * @param {?string} [audio.name]
     * @param {string} audio.mime
     * @returns {Audio} the created AudioFile or null
     */
    static createFromComputer (audio, serverUrl) {
        if( audio && audio.id && audio.mime ) {
            let audioFile = new AudioFile( audio.id, audio.name, audio.mime, null, );
            audioFile.setSource( File.SOURCE.COMPUTER);
            if( serverUrl) {
                audioFile.setUrl(`${serverUrl}/personal_files/${audio.id}`);
            }
            return audioFile;
        }
        else {
            return null;
        }
    }

    /**
     * Create an audio starting from a file obtained
     * from library react-native-document-picker
     * @param {any} audio
     * @param {string} audio.uri
     * @param {?string} [audio.fileName]
     * @param {string} audio.type
     * @returns {Audio} the created AudioFile or null
     */
    static createFromDocumentPicker (audio) {
        if( audio && audio.type ) {
            let audioFile = new AudioFile( audio.fileName, audio.fileName, audio.type, null, audio.uri);
            audioFile.setSource( File.SOURCE.GALLERY);
            audioFile.setSize(audio.fileSize);
            return audioFile;
        }
        else {
            return null;
        }
    }

    /** Create an audio from an existing card */
    static createFromCardSelectionAction ( card ) {
        if( !card.selection_action) { return null;}
        switch( card.selection_action) {
            case "play_sound":
                return new AudioFile( null, I18n.t("audio"), "audio/mpeg", null, null, card.selection_sound);
            default:
                return null;
        }
    }

    clone () {
        let clone = AudioFile.createFromFileObject(super.clone());
        clone.setDuration(this.duration);
        return clone;
    }

    getType () {
        return "audio";
    }

    /**
     * @returns {string} the duration on the format "mm:ss"
     */
    getDuration () {
        return this.duration;
    }

    /**
     * Set the duration of the audio
     * @param {string} duration on the format "mm:ss"
     */
    setDuration (duration) {
        this.duration = duration;
    }
}