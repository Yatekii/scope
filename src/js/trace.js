import * as helpers from './helpers.js';

// Creates a new trace
export const  NormalTrace = function (state) {
    // Remember trace state
    this.state = state;

    // Assign class variables
    this.on = true;

    // Create the data buffer
    
    if(state.source.node && state.source.node.ctrl.ready) {
        if(this.state.source.node.type != 'WebsocketSource'){
            this.data = new Float32Array(state.source.frameSize);
        } else {
            this.data = new Float32Array(state.source.node.ctrl.analyzer.frequencyBinCount);
        }
    }
    this.fetched = false;
};

NormalTrace.prototype.setSource = function(source){
    this.data = new Float32Array(this.state.source.node.analyzer.frequencyBinCount);
};

// Preemptively fetches a new sample set
NormalTrace.prototype.fetch = function () {
    if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
        if(this.state.source.node.type != 'WebsocketSource'){
            if(!this.data){
                this.data = new Float32Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
            }
            this.state.source.node.ctrl.analyzer.getFloatTimeDomainData(this.data);
        } else {
            this.data = this.state.source.node.ctrl.data;
        }
    }
    this.fetched = true;
};

// Draws trace on the new frame
NormalTrace.prototype.draw = function (context, scope, traceConf, triggerLocation) {
    // Store brush
    context.save();
    context.strokeWidth = 1;

    // Get a new dataset
    this.fetch();

    // Draw trace
    context.strokeStyle = this.state.color;
    context.beginPath();
    // Draw samples
    var halfHeight = scope.height / 2;
    var skip = 1;
    var mul = 1;
    var ratio = scope.width / this.data.length * scope.scaling.x;
    if(ratio > 1){
        mul = Math.ceil(ratio);
    } else {
        skip = Math.floor(1 / ratio);
    }
    context.moveTo(0, (halfHeight - (this.data[triggerLocation] + traceConf.offset) * halfHeight * scope.scaling.y));
    for (var i=triggerLocation, j=0; (j < scope.width) && (i < this.data.length); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (this.data[i] + traceConf.offset) * halfHeight * scope.scaling.y));
    }
    // Fix drawing on canvas
    context.stroke();

    // Draw mover
    context.fillStyle = this.state.color;
    var offset = this.state.offset;
    if(offset > 1){
        offset = 1;
    } else if(offset < -1){
        offset = -1;
    }
    context.fillRect(
        scope.width - scope.ui.mover.width - scope.ui.mover.horizontalPosition,
        halfHeight - traceConf.offset * halfHeight * scope.scaling.y - scope.ui.mover.height / 2,
        scope.ui.mover.width,
        scope.ui.mover.height
    );

    // Restore brush
    context.restore();

    // Mark data as deprecated
    this.fetched = false;
};

// Creates a new source
export const FFTrace = function(state) {
    // Remember trace state
    this.state = state;

    this.on = true;
    
    // Create the data buffer
    if(state.source.node && state.source.node.ctrl.ready) {
        this.data = new Float32Array(state.source.node.ctrl.analyzer.frequencyBinCount);
    }
    this.fetched = false;
};

FFTrace.prototype.setSource = function(source){
    this.data = new Float32Array(this.state.source.node.analyzer.frequencyBinCount);
};


// Preemptively fetches a new sample set
FFTrace.prototype.fetch = function () {
    if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
        if(!this.data){
            this.data = new Float32Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
        }
        this.state.source.node.ctrl.analyzer.getFloatFrequencyData(this.data);
    }
    this.fetched = true;
};

// Draws trace on the new frame
FFTrace.prototype.draw = function (context, scope, traceConf, triggerLocation) {
    var SPACING = 1;
    var BAR_WIDTH = 1;
    var numBars = Math.round(scope.width / SPACING);
    var multiplier = this.state.source.node.ctrl.analyzer.frequencyBinCount / numBars;

    // Store brush
    context.save();
    context.lineCap = 'round';

    // Get a new dataset
    this.fetch();

    // Draw rectangle for each frequency
    var halfHeight = scope.height / 2;
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++) {
            magnitude += this.data[offset + j];
        }
        magnitude = magnitude / multiplier * 4;
        context.fillStyle = 'hsl(' + Math.round((i * 360) / numBars) + ', 100%, 50%)';
        context.fillRect(i * SPACING, -magnitude + traceConf.offset * scope.height, BAR_WIDTH, scope.height + magnitude);
    }

    // Draw mover
    context.fillStyle = this.state.color;
    var offset = this.state.offset;
    if(offset > 1){
        offset = 1;
    } else if(offset < -1){
        offset = -1;
    }
    context.fillRect(
        scope.width - scope.ui.mover.width - scope.ui.mover.horizontalPosition,
        halfHeight - traceConf.offset * halfHeight * scope.scaling.y - scope.ui.mover.height / 2,
        scope.ui.mover.width,
        scope.ui.mover.height
    );

    // Restore brush
    context.restore();

    // Mark data as deprecated
    this.fetched = false;

    return triggerLocation;
};
