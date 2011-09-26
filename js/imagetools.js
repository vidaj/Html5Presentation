/**
 * Created by PyCharm.
 * User: vidaj
 * Date: 9/20/11
 * Time: 4:32 PM
 * To change this template use File | Settings | File Templates.
 */



var Scale = function() {
    var Scale = function(steps, updater) {
        this.steps = steps;
        this.scale = 1;
        this.updater = updater;
    };

    Scale.prototype.update = function(event, delta) {
        this.scale += (delta / this.steps);
        this.updater.update();
    };

    Scale.prototype.setTransform = function(context) {
        context.scale(this.scale, this.scale);
    };

    Scale.prototype.activate = function(canvas) {
        if (!this.eventHandler) {
            var myScope = this;
            this.eventHandler = function(event, delta) {
                myScope.update.call(myScope, event, delta);
            };
        }
        $(canvas).mousewheel(this.eventHandler);
    };

    Scale.prototype.deactivate = function(canvas) {
        $(canvas).unbind('mousewheel', (this.eventHandler));
    };
    return Scale;
}();

var Rotate = function() {

    var Rotate = function(updater) {
        this.angle = 0;
        this.updater = updater;
    };

    Rotate.prototype.start = function(e) {
        this.isActive = true;
        this.previousY = e.pageY;
    };

    Rotate.prototype.stop = function(e) {
        this.isActive = false;
    };

    Rotate.prototype.update = function(e) {
        if(!this.isActive) {
            return;
        }

        var y = e.pageY;
        this.angle -= y - this.previousY;
        this.previousY = y;

        this.updater.update();
    };

    Rotate.prototype.setTransform = function(context) {
        context.rotate(this.angle * Math.PI/180);
    };


    Rotate.prototype.activate = function(canvas) {
        if (!this.handlers) {
            this.handlers = createHandlers(this);
        }
        $(canvas).bind('mousedown', this.handlers.start);
        $(canvas).bind('mousemove', this.handlers.update);
        $(canvas).bind('mouseup', this.handlers.stop);
    };

    Rotate.prototype.deactivate = function(canvas) {
        $(canvas).unbind('mousedown', this.handlers.start);
        $(canvas).unbind('mousemove', this.handlers.update);
        $(canvas).unbind('mouseup', this.handlers.stop);
    };

    var createHandlers = function(scope) {
        return {
            start: function(e) { scope.start.call(scope, e); },
            stop: function(e) { scope.stop.call(scope, e); },
            update: function(e) { scope.update.call(scope, e); }
        };
    };

    return Rotate;
}();

var ImageStats = function(image) {
    this.height = image.clientHeight;
    this.width = image.clientWidth;
};


var ImageUpdater = function() {



    /**
     *
     * @param canvas The canvas that the edited image will be painted on.
     * @param image The original image. This must be visible on the page to calculate correct drawing-sizes.
     * @param eventHub The eventHub connected to this specific image.
     */
    var ImageUpdater = function(canvas, image, eventHub) {
        var me = this;
        this.actions = {
            "Rotate" : new Rotate(me),
            "Scale" : new Scale(10, me),
            "NoAction" : {
                activate: function(canvas) {},
                deactivate: function(canvas) {},
                setTransform: function(context) {}
            }
        };

        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.image = image;
        this.imageStats = new ImageStats(canvas);
        this.currentAction = this.actions["NoAction"];

        eventHub.subscribeTo("ImgEdit:ChangeTool", this.changeAction, this);

        this.update();
    };

    ImageUpdater.prototype.changeAction = function(action) {
        var newAction = this.actions[action];
        this.currentAction.deactivate(this.canvas);
        this.currentAction = newAction;
        this.currentAction.activate(this.canvas);
    };

    ImageUpdater.prototype.update = function() {

        var height = this.canvas.clientHeight;
        var width = this.canvas.clientWidth;

        var halfHeight = Math.abs(height / 2);
        var halfWidth = Math.abs(width / 2);

        this.context.save();
        this.context.clearRect(0, 0, width, height);
        this.context.translate(halfWidth, halfHeight);

        for (var controlKey in this.actions) {
            if (this.actions.hasOwnProperty(controlKey)) {
                this.actions[controlKey].setTransform(this.context);
            }
        }
        this.context.drawImage(this.image, -halfWidth, -halfHeight, width, height);
        this.context.restore();
    };

    return ImageUpdater;
}();

var elementFactory = {
    createCanvas: function() {
        return document.createElement('canvas');
    }
};

var ImageEditorView = function() {

    var View = function(eventHub) {
        this.eventHub = eventHub;
        eventHub.subscribeTo("ImgEdit:SetupControls", this.setupImageEditControls, this);
    };


    /**
     * Creates a canvas from the image, and replaces the image with the canvas in the DOM.
     * @param image
     * @return {HTMLElement} The created canvas.
     */

    View.prototype.replaceImageWithCanvas = function(image) {
        var imageStats = new ImageStats(image);
        
        image = $(image);

        var canvas = elementFactory.createCanvas();
        $(canvas).addClass('snapshot');
        $(canvas).attr('height', imageStats.height);
        $(canvas).attr('width', imageStats.width);

        $(canvas).insertBefore(image);
        image.detach();
        return canvas;
    };

    View.prototype.setupImageEditControls = function(canvas, actions) {
        var controlTemplate = $($('#canvasEditTemplate')[0].innerHTML);
        var controls = controlTemplate.clone();

        var rotateButton = controls.find('.rotateButton');
        var scaleButton = controls.find('.scaleButton');
        var doneButton = controls.find('.doneEditingButton');

        rotateButton.bind('click', actions['rotate']);
        scaleButton.bind('click', actions['scale']);
        doneButton.bind('click', actions['done']);

        var activateEditorAction = function() {
            controls.removeClass('disabled');
            $(canvas).unbind('click', activateEditorAction);
        };

        controls.addClass('disabled');
        $(canvas).bind('click', activateEditorAction);

        doneButton.bind('click', function() {
            controls.addClass('disabled');
            $(canvas).bind('click', activateEditorAction);
        });

        controls.insertAfter(canvas);
    };

    return View;
}();



var ImageEditor = function(image) {
    var eventHub = new EventHub();

    var view = new ImageEditorView(eventHub);
    var canvas = view.replaceImageWithCanvas(image);
    var model = new ImageUpdater(canvas, image, eventHub);


    var actions = {
        rotate: function() { eventHub.fireEvent("ImgEdit:ChangeTool", "Rotate"); },
        scale: function() { eventHub.fireEvent("ImgEdit:ChangeTool", "Scale"); }
    };

    //eventHub.fireEvent("ImgEdit:SwapImageWithCanvas", image, canvas);
    eventHub.fireEvent("ImgEdit:SetupControls", canvas, actions);
};


