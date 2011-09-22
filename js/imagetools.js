/**
 * Created by PyCharm.
 * User: vidaj
 * Date: 9/20/11
 * Time: 4:32 PM
 * To change this template use File | Settings | File Templates.
 */

var ImageStats = function(image) {
    this.height = image.clientHeight;
    this.width = image.clientWidth;
};

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
    }

    return Rotate;
}();

var noAction = {
    activate: function(canvas) {},
    deactivate: function(canvas) {}
};


var ImageUpdater = function(canvas, image, imageStats) {
    this.scaleAction = new Scale(10, this);
    this.rotateAction = new Rotate(this);
    this.controls = [this.scaleAction, this.rotateAction];
    this.context = canvas.getContext('2d');
    this.canvas = canvas;
    this.image = image;
    this.imageStats = imageStats;
    this.currentAction = noAction;
};

ImageUpdater.prototype.changeAction = function(action) {
    this.currentAction.deactivate(this.canvas);
    this.currentAction = action;
    this.currentAction.activate(this.canvas);
};

ImageUpdater.prototype.update = function() {
    var length = this.controls.length;
    var controls = this.controls;

    this.context.save();
    this.context.clearRect(0, 0, this.imageStats.width, this.imageStats.height);
    this.context.translate(this.imageStats.width / 2, this.imageStats.height / 2);
    for (var i = 0; i < length; i++) {
        var control = controls[i];
        control.setTransform(this.context);
    }
    this.context.drawImage(this.image, -(this.imageStats.width/2), -(this.imageStats.height/2), this.imageStats.width, this.imageStats.height);
    this.context.restore();
};




var Editor = function(image, controlTemplate) {
    this.image = image;
    this.imageStats = new ImageStats(image);
    this.canvas = document.createElement('canvas');
    $(this.canvas).attr('height', this.imageStats.height);
    $(this.canvas).attr('width', this.imageStats.width);
    this.canvas.getContext('2d').drawImage(image, 0, 0);

    this.updater = new ImageUpdater(this.canvas, this.image, this.imageStats);

    var controls = $(controlTemplate.clone());
    controls.addClass('disabled');
    var rotateButton = controls.find('.rotateButton');
    var scaleButton = controls.find('.scaleButton');
    var doneButton = controls.find('.doneEditingButton');

    var enableEditAction = function() {
        controls.removeClass('disabled');
    };

    $(this.canvas).bind('click', enableEditAction);

    $(this.canvas).insertBefore($(image));
    controls.insertAfter(this.canvas);

    $(image).detach();

    var scope = this;
    rotateButton.bind('click', function() {
       scope.updater.changeAction(scope.updater.rotateAction);
    });

    scaleButton.bind('click', function() {
       scope.updater.changeAction(scope.updater.scaleAction);
    });

    $(doneButton).bind('click', function() {
        controls.addClass('disabled');
        scope.updater.changeAction(noAction);
        $(scope.canvas).bind('click', enableEditAction);
    })

};


