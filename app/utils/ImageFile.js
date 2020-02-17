import File from "./File";

/** An image file */
export default class ImageFile extends File {
 
    constructor ( id, name, mime, path, url, thumbnail = null) {
        super(id, name, mime, path, url, thumbnail);
        this.width = null;
        this.height = null;
        this.cropRect = null;
    }

    static createFromFileObject (file) {
        if( file instanceof File ) {
            let newImage = new ImageFile(file.id, file.name, file.mime, file.path, file.url, file.thumbnail);
            newImage.setSource(file.getSource());
            newImage.setSize(file.getSize());
            newImage.setBase64Data(file.getBase64Data());
            return newImage;
        }
        else {
            return null;
        }
    }

    /**
     * Create an image starting from a file saved into the
     * personal_files folder
     * @param {any} image
     * @param {string} image.id
     * @param {?string} [image.name]
     * @param {string} image.mime
     * @param {string} image.data the base64 data of the thumbnail
     * @returns {ImageFile} the created AudioFile or null
     */
    static createFromComputer (image, serverUrl) {
        if( image && image.id && image.mime ) {
            let imageThumbnail = new ImageFile( image.id, `thumb_${image.name}`, image.mime, null, null);
            imageThumbnail.setSource( File.SOURCE.COMPUTER);
            imageThumbnail.setBase64Data( image.data);
            let imageFile = new ImageFile( image.id, image.name, image.mime, null, null, imageThumbnail);
            imageFile.setSource( File.SOURCE.COMPUTER);
            if( serverUrl) {
                imageFile.setUrl(`${serverUrl}/personal_files/${image.id}`);
            }
            return imageFile;
        }
        else {
            return null;
        }
    }

    /**
     * Create an image starting from a file obtained
     * from library react-native-image-crop-picker
     * @param {any} image
     * @param {string} [image.filename]
     * @param {string} image.path
     * @param {string} image.mime
     * @param {number} image.size
     * @param {string} image.data base64 string of the image
     * @param {any} [image.cropRect]
     * @returns {ImageFile} the created AudioFile or null
     */
    static createFromImageCropPicker (image) {
        if( image && image.mime ) {
            let imageFile = new ImageFile( image.filename, image.filename, image.mime, image.path, null);
            imageFile.setSource( File.SOURCE.GALLERY);
            imageFile.setBase64Data(image.data);
            imageFile.setSize(image.size);
            imageFile.setWidthHeight( image.width, image.height);
            imageFile.setCropRect( image.cropRect);
            return imageFile;
        }
        else {
            return null;
        }
    }

    clone () {
        let clone = ImageFile.createFromFileObject(super.clone());
        clone.setWidthHeight( this.width, this.height);
        clone.setCropRect( this.cropRect);
        return clone;
    }

    getType () {
        return "image";
    }

    /** If this image has no thumbnail, use this image as thumbnail */
    getThumbnail () {
        return this.thumbnail || this;
    }

    getWidth () {
        return this.width;
    }

    getHeight () {
        return this.height;
    }

    getCropRect () {
        return this.cropRect;
    }

    setWidthHeight ( width, height ) {
        this.width = width;
        this.height = height;
    }

    setCropRect ( cropRect ) {
        this.cropRect = cropRect;
    }
}