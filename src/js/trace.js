import * as helpers from './helpers.js';

// Creates a new trace
export const  NormalTrace = function (state) {
    // Remember trace state
    this.state = state;

    // Assign class variables
    this.on = true;

    // Create the data buffer
    if(state.source.node && state.source.node.ctrl.ready) {
        this.data = new Float32Array(state.source.node.ctrl.analyzer.frequencyBinCount);
    }
    this.fetched = false;
};

NormalTrace.prototype.setSource = function(source){
    this.data = new Float32Array(this.state.source.node.analyzer.frequencyBinCount);
};

// Preemptively fetches a new sample set
NormalTrace.prototype.fetch = function () {
    if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
        if(!this.data){
            this.data = new Float32Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
        }
        this.state.source.node.ctrl.analyzer.getFloatTimeDomainData(this.data);
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
    var halfHeight = scope.height / 2;
    context.moveTo(0, (halfHeight - this.data[triggerLocation] * halfHeight * scope.scaling));
    for (var i=triggerLocation, j=0; (j < scope.width) && (i < this.data.length); i++, j++){
        context.lineTo(j, (halfHeight - this.data[i] * halfHeight * scope.scaling));
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
        scope.width - scope.ui.mover.width,
        halfHeight - offset * halfHeight * scope.scaling - scope.ui.mover.height,
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
