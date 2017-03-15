import * as helpers from './helpers.js';

// Creates a new trace
export const  NormalTrace = function (state) {
    // Remember trace state
    this.state = state;

    // Assign class variables
    this.on = true;

    // Create the data buffer
    if(state.source.node && state.source.node.ctrl.ready) {
        this.data = new Uint8Array(state.source.node.ctrl.analyzer.frequencyBinCount);
    }
    this.fetched = false;
};

NormalTrace.prototype.setSource = function(source){
    this.data = new Uint8Array(this.state.source.node.analyzer.frequencyBinCount);
};

// Preemptively fetches a new sample set
NormalTrace.prototype.fetch = function () {
    if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
        if(!this.data){
            this.data = new Uint8Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
        }
        this.state.source.node.ctrl.analyzer.getByteTimeDomainData(this.data);
    }
    this.fetched = true;
};

// Draws trace on the new frame
NormalTrace.prototype.draw = function (context, scope, triggerLocation) {
    // Store brush
    context.save();
    context.strokeWidth = 1;

    // Get a new dataset
    this.fetch();

    // Draw trace
    context.strokeStyle = this.state.color;
    context.beginPath();
    // Draw samples
    context.moveTo(0, (256 - this.data[triggerLocation]) * scope.scaling);
    for (var i=triggerLocation, j=0; (j < scope.width) && (i < this.data.length); i++, j++){
        context.lineTo(j, (256 - this.data[i]) * scope.scaling);
    }
    // Fix drawing on canvas
    context.stroke();

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
        this.data = new Uint8Array(state.source.node.ctrl.analyzer.frequencyBinCount);
    }
    this.fetched = false;
};

FFTrace.prototype.setSource = function(source){
    this.data = new Uint8Array(this.state.source.node.analyzer.frequencyBinCount);
};


// Preemptively fetches a new sample set
FFTrace.prototype.fetch = function () {
    if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
        if(!this.data){
            this.data = new Uint8Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
        }
        this.state.source.node.ctrl.analyzer.getByteFrequencyData(this.data);
    }
    this.fetched = true;
};

// Draws trace on the new frame
FFTrace.prototype.draw = function (context, scope, triggerLocation) {
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
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++) {
            magnitude += this.data[offset + j];
        }
        magnitude = magnitude / multiplier;
        context.fillStyle = 'hsl(' + Math.round((i*360)/numBars) + ', 100%, 50%)';
        context.fillRect(i * SPACING, scope.width, BAR_WIDTH, -magnitude);
    }

    // Restore brush
    context.restore();

    // Mark data as deprecated
    this.fetched = false;

    return triggerLocation;
};
