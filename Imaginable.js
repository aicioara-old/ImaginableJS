var Imaginable = (function() {

    /**
     * @arg {input} <input> DOM element, or the ID (prefixed by #)
     * @arg {callback} function(Imag) which will be called having the
     * imag as argument
     */
    var onImageLoad = function(input, callback) {
        input = $(input);
        $(input).change(function() {
            var imag = new Imag(this);
            imag.onImageReady(callback, this, imag);
        });
    }

    // http://stackoverflow.com/questions/19032406/convert-html5-canvas-into-file-to-be-uploaded
    var dataURLToFile = function(dataURL) {
        var blobBin = atob(dataURL.split(',')[1]);
        var array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var file = new Blob([new Uint8Array(array)], {type: 'image/png'});

        return file;
    }

    /**
     * Wrapper around the image itself
     */
    function Imag(input) {
        // Instance variables
        this.image = null;
        this.input = null;
        this.canvas = null;

        this.callbackList = [];

        if (input) {
            this.load(input);
        }
    }

    /**
     *
     * @deprecated
     *
     * Executes the callbacks queued in te callabckList in the order they were pushed
     * the format of a callback is
     * [functionName, thisContext, args...]
     */
    Imag.prototype.executeCallbacks = function() {
        this.callbackList.forEach(function(elem) {
            var callback = elem[0];
            var _this = elem[1];
            elem.splice(0, 2);
            callback.apply(_this, elem);
        });
    }

    Imag.prototype.onImageReady = function(callback, _this, image) {
        if (this.image && this.image.complete) {
            callback(this);
        } else {
            this.callbackList.push([callback, _this, image]);
        }
    }

    Imag.prototype.load = function(input) {
        if (!input || !input.files || !input.files[0]) {
            throw Error("No files given");
        }

        if (!input.files[0].type.match(/image.*/)) {
            throw Error("The file selected is not an image");
        };

        this.image = document.createElement('img');
        this.image.src = window.URL.createObjectURL(input.files[0]);

        this.input = input;

        var _this = this;
        this.image.onload = function() {
            _this.executeCallbacks();
        }

        return this.image;
    }

    /**
     * Asynchronous
     */
    Imag.prototype.drawOnCanvas = function(canvas, finalWidth, finalHeight) {
        if (!this.image || !this.image.complete) {
            console.error("Cannot drawOnCanvas an image which was not loaded yet");
        }

        finalWidth = finalWidth ? finalWidth : 40;
        finalHeight = finalHeight ? finalHeight : 60;

        if (!canvas) {
            canvas = $("<canvas>", {
                style: "display: none",
            });
            $(document.body).append(canvas);
            canvas = canvas[0];
        }

        this.canvas = canvas;

        var width = this.image.width;
        var height = this.image.height;

        if (width > height) {
          if (width > finalWidth) {
            height *= finalWidth / width;
            width = finalWidth;
          }
        } else {
          if (height > finalHeight) {
            width *= finalHeight / height;
            height = finalHeight;
          }
        }
        this.canvas.width = width;
        this.canvas.height = height;
        var ctx = this.canvas.getContext("2d");
        ctx.drawImage(this.image, 0, 0, width, height);

        return this.canvas;
    }

    Imag.prototype.download = function(fileName) {
        if (!this.image || !this.image.complete) {
            console.error("Cannot drawOnCanvas an image which was not loaded yet");
        }

        if (!fileName) {
            fileName = "image.png";
        }

        if (!this.canvas) {
            throw Error("Canvas has not been created yet");
        }

        //TODO: remove the click HTML text
        var dataurl = this.canvas.toDataURL();
        var anchor = $("<a>", {
            href: dataurl,
            download: "file.png",
        }).html("click")[0].click();
    }

    Imag.prototype.sendToServer = function(server, imageName, callback) {
        if (!this.image || !this.image.complete) {
            console.error("Cannot drawOnCanvas an image which was not loaded yet");
        }

        if (!this.input) {
            throw Error("No arguments given");
        }

        if (!this.input.files) {
            throw Error("Element given is not a file input")
        }

        if (!this.input.files[0]) {
            throw Error("No files given");
        }

        if (!this.input.files[0].type.match(/image.*/)) {
            throw Error("The file selected is not an image");
        };

        if (!imageName) {
            imageName = "new_picture";
        }

        if (!server) {
            throw Error("No server specified");
        }

        var data = new FormData();

        dataURL = this.canvas.toDataURL("image/jpeg");
        data.append(imageName, dataURLToFile(dataURL));

        jQuery.ajax({
            url: server,
            type: "POST",
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: callback,
        });
    }

    /**
     * Public methods
     */
    return {
        onImageLoad: onImageLoad,
    };

})();
