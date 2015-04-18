var Imaginable = (function() {

    var getInstance = function() {
        return new Imag();
    }

    function Imag(input) {
        if (input) {
            this.loadImage(input);
        }
    }

    Imag.prototype.load = function(input) {

        if (!input || !input.files || !input.files[0]) {
            throw Error("No files given");
        }

        if (!input.files[0].type.match(/image.*/)) {
            throw Error("The file selected is not an image");
        };

        this.img = document.createElement('img');
        this.img.src = window.URL.createObjectURL(input.files[0]);

        this.input = input;

        return this.img;
    }

    Imag.prototype.drawOnCanvas = function(canvas, finalWidth, finalHeight) {
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

        var width = this.img.width;
        var height = this.img.height;

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
        ctx.drawImage(this.img, 0, 0, width, height);

        return this.canvas;

    }

    Imag.prototype.download = function(fileName) {
        if (!this.canvas) {
            throw Error("Canvas has not been created yet");
        }

        if (!fileName) {
            fileName = "image.png";
        }

        var dataurl = this.canvas.toDataURL();
        var anchor = $("<a>", {
            href: dataurl,
            download: "file.png",
        }).html("click")[0].click();
    }


    Imag.prototype.sendToServer = function(server, imageName, callback) {
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
