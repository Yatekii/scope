import * as helpers from './helpers.js';

// Creates a new source
export const WebsocketSource = function(state) {
    var me = this;
    // Remember source state
    this.state = state;

    this.channels = [new Float32Array(0), new Float32Array(0)];

    // Init socket
    this.socket = new WebSocket(state.location);
    this.socket.binaryType = 'arraybuffer';

    // Socket open event
    this.socket.onopen = function() {
        console.log('Connected to ' + state.location + '!');
        me.isOpen = true;
        // Configure logger initially and start a frame according to the mode
        me.setNumberOfChannels(me.state.numberOfChannels);
        me.frameConfiguration(me.state.frameSize, me.state.frameSize / 8 * 1, me.state.frameSize / 8 * 7);
        me.triggerOn(me.state.trigger);
        if(me.state.mode == 'single'){
            // We don't have to do anything, we already did our job
        }
        if(me.state.mode == 'normal'){
            // Immediately request a new frame
            me.normal();
        }
        if(me.state.mode == 'auto'){
            // Immediately request a new frame and start a timer to force a trigger (in case none occurs on iself)
            me.auto();
        }
        me.channels;
        me.ready = true;
    };

    // Received message event
    this.socket.onmessage = function(e) {
        if(me.ready){
            if (typeof e.data == 'string') {
                console.log('Text message received: ' + e.data);
            } else {
                // TODO: distinguish between channels
                // New data from stream
                var arr = new Uint16Array(e.data);
                var data = new Float32Array(arr);
                for(var i = 0; i < arr.length; i++){
                    // 14 bit uint to float
                    data[i] = (arr[i] - Math.pow(2, (me.state.bits - 1))) / Math.pow(2, (me.state.bits - 1));
                }
                me.channels[0] = data;
                // Start a new frame if mode is appropriate otherwise just exit
                if(me.state.mode == 'single'){
                    // We don't have to do anything, we already did our job
                }
                if(me.state.mode == 'normal'){
                    // Immediately request a new frame
                    me.normal();
                }
                if(me.state.mode == 'auto'){
                    // Immediately request a new frame and start a timer to force a trigger (in case none occurs on iself)
                    me.auto();
                }
            }
        }
    };

    // Socket close event
    this.socket.onclose = function() {
        console.log('Connection closed.');
        me.socket = null;
        me.isOpen = false;
        me.ready = false;
    };
};

WebsocketSource.prototype.sendMsg = function(txt) {
    this.socket.send(txt);
};

WebsocketSource.prototype.sendJSON = function(obj) {
    this.socket.send(JSON.stringify(obj));
};

WebsocketSource.prototype.requestFrame = function() {
    this.sendJSON({
        triggerOn: {
            type: this.state.trigger.type,
            channel: this.state.trigger.channel,
            // TODO: Fix trigger level sent (+ trace offset)
            level: Math.round(this.state.trigger.level * Math.pow(2, (this.state.bits - 1)) + Math.pow(2, (this.state.bits - 1))),
            hysteresis: this.state.trigger.hystresis,
            slope: this.state.trigger.slope
        },
        requestFrame: true
    });
};

WebsocketSource.prototype.forceTrigger = function() {
    this.sendJSON({ forceTrigger: true });
};

WebsocketSource.prototype.frameConfiguration = function(frameSize, pre, suf) {
    this.sendJSON({ frameConfiguration: { frameSize: frameSize, pre: pre, suf: suf } });
};

WebsocketSource.prototype.triggerOn = function(trigger) {
    this.sendJSON({ triggerOn: trigger });
};

WebsocketSource.prototype.setNumberOfChannels = function(n) {
    this.sendJSON({ setNumberOfChannels: n });
};

WebsocketSource.prototype.triggerOnRisingEdge = function(channel, level, hysteresis = 2, slope = 0) {
    this.sendJSON({ triggerOn: { type: 'risingEdge', channel: channel, level: level, hysteresis: hysteresis, slope: slope }});
};

WebsocketSource.prototype.single = function() {
    this.state.mode = 'single';
    this.requestFrame();
};

WebsocketSource.prototype.normal = function() {
    this.state.mode = 'normal';
    var me = this;
    setTimeout(function(){ me.requestFrame(); }, 5);
};

WebsocketSource.prototype.auto = function(timeout) {
    var me = this;
    this.state.mode = 'auto';
    this.requestFrame();
    // TODO: fix
    // setTimeout(function(){ me.forceTrigger() }, 50);
};