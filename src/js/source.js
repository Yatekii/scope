/* This file contains the source class which is responsible for
 * communicating to the server and parse it's data.
 */

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
        me.frameConfiguration(
            me.state.frameSize,
            me.state.frameSize * me.state.triggerPosition,
            me.state.frameSize * (1 - me.state.triggerPosition)
        );
        me.triggerOn(me.state.trigger);
        me.receivingChannel = 0;
        if(me.state.mode == 'single'){
            // We don't have to do anything, we already did our job
        }
        if(me.state.mode == 'normal'){
            // Immediately request a new frame
            me.normal(0);
        }
        if(me.state.mode == 'auto'){
            // Immediately request a new frame and start a timer to force a trigger (in case none occurs on iself)
            me.auto(0);
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
                    // 16 bit uint to float
                    data[i] = (arr[i] / Math.pow(2, me.state.bits) - 0.5) * me.state.vpp;
                }
                me.channels[me.receivingChannel++] = data;
                // If we didn't receive all channels yet, receive the next one
                if(me.receivingChannel != me.state.numberOfChannels){
                    me.readFrame(me.receivingChannel);
                    return;
                } else {
                    me.receivingChannel = 0;
                }
                // Start a new frame if mode is appropriate otherwise just exit
                if(me.state.mode == 'single'){
                    // We don't have to do anything, we already did our job
                }
                if(me.state.mode == 'normal'){
                    // Immediately request a new frame
                    me.normal(0);
                }
                if(me.state.mode == 'auto'){
                    // Immediately request a new frame and start a timer to force a trigger (in case none occurs on iself)
                    me.auto(0);
                }
                me.state.traces.forEach(function(trace){
                    if(trace.type == 'TimeTrace'){
                        trace.offset.x = 0;
                    }
                });
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

/*
 * Sends a JS object as JSON to the source websocket.
 * <obj> : Object : Object to be sent over the network as a JSON string
 */
WebsocketSource.prototype.sendJSON = function(obj) {
    console.log(JSON.stringify(obj))
    this.socket.send(JSON.stringify(obj));
};

/*
 * Requests a new frame from the webserver. Includes all necessary config.
 */
WebsocketSource.prototype.requestFrame = function(channel) {
    this.sendJSON({
        // Always set the current frameSize and triggerPosition
        frameConfiguration: {
            frameSize: this.state.frameSize,
            pre: Math.round(this.state.frameSize * this.state.triggerPosition),
            suf: Math.round(this.state.frameSize * (1 - this.state.triggerPosition))
        },
        // Always set the current trigger
        // TODO: Zero out triggers for other channels
        triggerOn: {
            type: this.state.trigger.type,
            channel: this.state.trigger.channel,
            level: Math.round(this.state.trigger.level * Math.pow(2, (this.state.bits - 1)) + Math.pow(2, (this.state.bits - 1))),
            hysteresis: this.state.trigger.hystresis,
            slope: this.state.trigger.slope
        },
        requestFrame: true,
        channel: channel,
    });
};

/*
 * Requests a new frame from the webserver. Includes all necessary config.
 */
WebsocketSource.prototype.readFrame = function(channel) {
    this.sendJSON({
        readFrame: true,
        channel: channel,
    });
};

/*
 * Sends a force trigger command to the server to issue an immediate frame.
 */
WebsocketSource.prototype.forceTrigger = function() {
    this.sendJSON({ forceTrigger: true });
};

/*
 * Configures the frame the server will send.
 * <frameSize> : uint : The number of samples returned by the server
 * <pre> : uint : The number of samples that have to be recorded before a trigger can be fired
 * <suf> : uint : The number of samples that have to be recorded after a trigger has been fired
 */
WebsocketSource.prototype.frameConfiguration = function(frameSize, pre, suf) {
    this.sendJSON({ frameConfiguration: { frameSize: frameSize, pre: pre, suf: suf } });
};

/*
 * Setup a trigger with a given <trigger> object.
 * <trigger> : TriggerObject : {
 *   type: ['risingEdge'],
 *   level: uint[0:65536],
 *   channel: uint[0:1],
 *   hysteresis: uint[0:4096],
 *   slope: uint[0:4096]
 * }
 */
WebsocketSource.prototype.triggerOn = function(trigger) {
    this.sendJSON({ triggerOn: trigger });
};

/*
 * Configures the number of channels the server should record.
 * <n> : uint[0:8] : The number of channels. If an odd number is chosen,
 *                   the next bigger even number iwll be configured
 * NOTE: The default implementation of the FPGA logger could theoretically log 8 channels
 * but it is restricted to two by the RedPitaya hardware.
*/
WebsocketSource.prototype.setNumberOfChannels = function(n) {
    this.sendJSON({ setNumberOfChannels: n });
};

/* Configures a rising edge trigger
 * <channel> : uint[0:1] : The channel for which the trigger is configured
 * <level> : uint[0, 65536] : The level at which the trigger shoots
 * <hysteresis> : uint[0:4096] : TODO:
 * <slope> : uint[0:4096] : TODO:
 */
WebsocketSource.prototype.triggerOnRisingEdge = function(channel, level, hysteresis = 2, slope = 0) {
    this.sendJSON({ triggerOn: { type: 'risingEdge', channel: channel, level: level, hysteresis: hysteresis, slope: slope }});
};

/*
 * Issue a single frame from the server.
*/
WebsocketSource.prototype.single = function(channel) {
    this.state.mode = 'single';
    this.requestFrame(channel);
};

/*
 * Start normal mode.
*/
WebsocketSource.prototype.normal = function(channel) {
    var me = this;
    this.state.mode = 'normal';
    // Wait 5ms until requesting a new frame because otherwise we deadlock
    setTimeout(function(){ me.requestFrame(channel); }, 5);
};

/*
 * Start auto mode.
 * <timeout> : uint : Milliseconds to wait until forcing triggering
 */
WebsocketSource.prototype.auto = function(channel, timeout) {
    var me = this;
    this.state.mode = 'auto';
    // Wait 5ms until requesting a new frame because otherwise we deadlock
    setTimeout(function(){ me.requestFrame(); }, 5);
    setTimeout(function(){
        me.forceTrigger();
    }, timeout);
};