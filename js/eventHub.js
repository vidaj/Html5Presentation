

var EventHub = function() {

    var Subscriber = function(method, scope) {
        this.method = method;
        this.scope = scope;
    };

    Subscriber.prototype.invoke = function(argList) {
        this.method.apply(this.scope, argList);
    };

    var EventHub = function() {
        this.channels = {};
    };

    EventHub.prototype.subscribeTo = function(channel, method, scope) {
        if (!this.channels[channel]) {
            this.channels[channel] = [];
        }
        this.channels[channel].push(new Subscriber(method, scope));
    };

    EventHub.prototype.fireEvent = function(channel) {
        if (!this.channels[channel]) {
            console.error("No subscribers for " + channel);
            return;
        }

        /* Removes 'channel' from argument and creates an array from the remaining arguments */
        var theArguments = Array.prototype.slice.call(arguments, 1);

        invokeSubscribersOfChannel(this.channels[channel], theArguments);
    };

    function invokeSubscribersOfChannel(subscribers, theArguments) {
        if (!subscribers) {
            return;
        }
        var length = subscribers.length;
        for (var i = 0; i < length; i++) {
            subscribers[i].invoke(theArguments);
        }
    }


    return EventHub;
}();

var globalEventHub = new EventHub();