import File from "./File";
import ImageFile from "./ImageFile";

/** A video file */
export default class VideoFile extends File {
 
    constructor ( id, name, mime, duration = null, path, url, thumbnail = null) {
        super(id, name, mime, path, url, thumbnail);
        this.duration = duration;
        this.width = null;
        this.height = null;
    }

    static createFromFileObject (file) {
        if( file instanceof File ) {
            let newVideo = new VideoFile(file.id, file.name, file.mime, null, file.path, file.url, file.thumbnail);
            newVideo.setSource(file.getSource());
            newVideo.setSize(file.getSize());
            newVideo.setBase64Data(file.getBase64Data());
            return newVideo;
        }
        else {
            return null;
        }
    }

    /**
     * Create an audio starting from a file saved into the
     * personal_files folder
     * @param {any} video
     * @param {string} video.id
     * @param {?string} [video.name]
     * @param {string} video.mime
     * @param {string} video.duration
     * @returns {VideoFile} the created AudioFile or null
     */
    static createFromComputer (video, serverUrl) {
        if( video && video.id && video.mime ) {
            let videoThumbnail = new ImageFile( video.id, `thumbnail_${video.name}`
                , "image/jpeg", null, null);
            videoThumbnail.setSource( File.SOURCE.COMPUTER);
            videoThumbnail.setBase64Data(video.data);
            let videoFile = new VideoFile( video.id, video.name, video.mime, video.duration
                , null, null, videoThumbnail );
            videoFile.setSource( File.SOURCE.COMPUTER);
            if( serverUrl) {
                videoFile.setUrl(`${serverUrl}/personal_files/${video.id}`);
            }
            return videoFile;
        }
        else {
            return null;
        }
    }

    /**
     * Create a video starting from a file obtained
     * from library react-native-image-crop-picker
     * @param {any} video
     * @param {string} [video.filename]
     * @param {string} video.path
     * @param {string} video.mime
     * @param {number} video.size
     * @returns {VideoFile} the created AudioFile or null
     */
    static createFromImageCropPicker (video) {
        if( video && video.mime ) {
            let videoFile = new VideoFile( null, video.filename, video.mime, null, video.path, null);
            videoFile.setSource( File.SOURCE.GALLERY);
            videoFile.setSize(video.size);
            videoFile.setWidthHeight( video.width, video.height);
            return videoFile;
        }
        else {
            return null;
        }
    }

    clone () {
        let clone = VideoFile.createFromFileObject(super.clone());
        clone.setDuration(this.duration);
        clone.setWidthHeight(this.width, this.height);
        return clone;
    }

    getType () {
        return "video";
    }

    /**
     * @returns {string} the duration on the format "mm:ss"
     */
    getDuration () {
        return this.duration;
    }

    getWidth () {
        return this.width;
    }

    getHeight () {
        return this.height;
    }

    /**
     * Set the duration of the audio
     * @param {string} duration on the format "mm:ss"
     */
    setDuration (duration) {
        this.duration = duration;
    }

    setWidthHeight ( width, height ) {
        this.width = width;
        this.height = height;
    }
}