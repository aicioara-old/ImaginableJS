var Imaginable = (function() {

    var getInstance = function() {
        return new Imag();
    }

    function Imag(input) {
        // Instance variables
        this.image = null;
        this.input = null;
        this.canvas = null;

        this.callbackList = [];

        if (input) {
            this.loadImage(input);
        }
    }

    Imag.prototype.executeCallbacks = function() {
        this.callbackList.forEach(function(elem) {
            var callback = elem[0];
            var _this = elem[1];
            elem.splice(0, 2);
            callback.apply(_this, elem);
        });

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

        var _this = this;
        if (!this.image.complete) {
            this.callbackList.push([_this.drawOnCanvas, _this, canvas, finalWidth, finalHeight]);
            return this.canvas;
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
        if (!fileName) {
            fileName = "image.png";
        }

        var _this = this;
        if (!this.image.complete) {
            this.callbackList.push([_this.download, _this, fileName]);
            return;
        }

        if (!this.canvas) {
            throw Error("Canvas has not been created yet");
        }

        var dataurl = this.canvas.toDataURL();
        var anchor = $("<a>", {
            href: dataurl,
            download: "file.png",
        }).html("click")[0].click();
    }

    Imag.prototype.sendToServer = function(server, imageName, callback) {

        var _this = this;
        if (!this.image.complete) {
            this.callbackList.push([_this.sendToServer, _this, server, imageName, callback]);
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
        data.append(imageName, this.input.files[0]);

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
        getInstance: getInstance,
    };

})();
