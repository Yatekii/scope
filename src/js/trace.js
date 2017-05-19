import { miniFFT} from './math/fft.js';
import { sum, ssum } from './helpers.js';
import { applyWindow, windowFunctions } from './math/windowing.js';

// Creates a new trace
export const  NormalTrace = function (state) {
    // Remember trace state
    this.state = state;

    // Init class variables
    this.on = true;
    this.fetched = false;
};

// Preemptively fetches a new sample set
NormalTrace.prototype.fetch = function () {
    // If it is not a WSS, data must be fetched from the Analyzer node
    if(this.state.source.node.type != 'WebsocketSource'){
        if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
            if(!this.data){
                this.data = new Float32Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
            }
            this.state.source.node.ctrl.analyzer.getFloatTimeDomainData(this.data);
        }
    }
    // Otherwise it will just be ensured the data is referenced from the source properly
    else {
        if(this.state.source.node.ctrl.data){
            this.data = this.state.source.node.ctrl.data;
        } else {
            this.data = new Float32Array();
        }
    }
    this.fetched = true;
};

// Draws trace on the new frame
NormalTrace.prototype.draw = function (canvas, scope, traceConf, triggerLocation) {
    var context = canvas.getContext('2d');
    // Store context state so other painters are presented with their known context state
    context.save();
    context.strokeWidth = 1;

    // Get a new dataset
    this.fetch();

    // Draw trace
    context.strokeStyle = this.state.color;
    context.beginPath();

    // Half height of canvas
    var halfHeight = scope.height / 2;

    // Draw every <skip> sample in data
    var skip = 1;

    // Apply sample to every <mul> pixel on canvas
    var mul = 1;

    // Calculate ratio of number of samples to number of pixels and factor in x-scaling
    // To calculate steps in the for loop to draw the trace
    var ratio = scope.width / this.data.length * scope.scaling.x;
    if(ratio > 1){
        mul = ratio;
    } else {
        skip = 1 / ratio;
    }

    // Actually draw the trace, starting at pixel 0 and data point at triggerLocation
    // triggerLocation is only relevant when using WebAudio
    // using an external source the source handles triggering
    context.moveTo(0, (halfHeight - (this.data[triggerLocation] + traceConf.offset) * halfHeight * scope.scaling.y));
    for (var i=triggerLocation, j=0; (j < scope.width) && (i < this.data.length); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (this.data[Math.floor(i)] + traceConf.offset) * halfHeight * scope.scaling.y));
    }
    context.stroke();

    // Draw mover (grab and draw to move the trace)
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

    // Restore canvas context for next painter
    context.restore();

    // Mark data as deprecated so we will fetch again next cycle
    this.fetched = false;
};

// Creates a new source
export const FFTrace = function(state) {
    // Remember trace state
    this.state = state;

    // Init class variables
    this.on = true;
    this.fetched = false;
};

// Preemptively fetches a new sample set
FFTrace.prototype.fetch = function () {
    // If it is not a WSS, data must be fetched from the Analyzer node
    if(this.state.source.node.type != 'WebsocketSource'){
        if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
            if(!this.data){
                this.data = new Float32Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
            }
            this.state.source.node.ctrl.analyzer.getFloatFrequencyData(this.data);
        }
        
    }
    // Otherwise it will just be ensured the data is referenced from the source properly
    else {
        if(this.state.source.node.ctrl.data){
            this.data = this.state.source.node.ctrl.data;
        } else {
            this.data = new Float32Array();
        }
    }
    this.fetched = true;
};

// Draws trace on the new frame
FFTrace.prototype.draw = function (canvas, scope, traceConf) {

    var i, j;
    var halfHeight = scope.height / 2;
    var context = canvas.getContext('2d');

    // Get a new dataset
    this.fetch();

    if(this.state.source.node.type != 'WebsocketSource'){
        var SPACING = 1;
        var BAR_WIDTH = 1;
        var numBars = Math.round(scope.width / SPACING);
        var multiplier = this.state.source.node.ctrl.analyzer.frequencyBinCount / numBars;

        // Store brush
        context.save();
        context.lineCap = 'round';

        // Draw rectangle for each frequency
        halfHeight = scope.height / 2;
        for (i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor(i * multiplier);
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (j = 0; j < multiplier; j++) {
                magnitude += this.data[offset + j];
            }
            magnitude = magnitude / multiplier * 4;
            context.fillStyle = 'hsl(' + Math.round((i * 360) / numBars) + ', 100%, 50%)';
            context.fillRect(i * SPACING, -magnitude + traceConf.offset * scope.height, BAR_WIDTH, scope.height + magnitude);
        }

        // Draw mover
        context.fillStyle = this.state.color;
        offset = this.state.offset;
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
    } else {
        console.log(scope);

        // Duplicate data
        var real = this.data.slice(0);
        // Create a complex vector with zeroes sice we only have real input
        var compl = new Float32Array(this.data.length);
        // Window data if a valid window was selected
        if(traceConf.windowFunction && windowFunctions[traceConf.windowFunction]){
            real = applyWindow(real, windowFunctions[traceConf.windowFunction]);
        }
        // Do an FFT of the signal
        miniFFT(real, compl);
        // Only use half of the FFT since we only need the upper half
        real = real.slice(0, real.length / 2);
        compl = compl.slice(0, compl.length / 2);

        // Create the the total power of the signal
        // P = V^2
        var ab = new Float32Array(real.length);
        for(i = 0; i < ab.length; i++){
            ab[i] = real[i]*real[i] + compl[i]*compl[i];
        }
        
        // Calculate SNR
        // var max = -3000000;
        // var maxi = 0;
        // for(i = 0; i < ab.length; i++){
        //     if(ab[i] > max){
        //         max = ab[i];
        //         maxi = i;
        //     }
        // }
        var sampleAtSignal = traceConf.signalFrequency / (scope.samplingRate / this.state.source.node.frameSize);
        // var m = (sum(ab.slice(0, maxi - 2)) + sum(ab.slice(maxi + 2))) / ab.length;
        var m = (sum(ab.slice(0, sampleAtSignal - 3)) + sum(ab.slice(sampleAtSignal + 3))) / ab.length;
        var n = [];
        var s = [];
        var max = 0;
        var maxi = 0;
        var pushed = 0;
        var firstSNRMarker = 0;
        // Add all values under the average and those above each to a list
        for(i = 0; i < ab.length; i++){
            if(ab[i] < m){
                n.push(ab[i]);
            }
            else {
                if(pushed == 0){
                    firstSNRMarker = i;
                }
                s.push(ab[i]);
                pushed = i;
            }
        }

        // Sum both sets and calculate their ratio which is the SNR
        var ss = ssum(s);
        var sn = ssum(n);
        var SNR = Math.log10(ss / sn) * 10;
        traceConf.info.SNR = SNR;

        // Convert spectral density to a logarithmic scale to be able to better plot it.
        // Scale it down by 200 for a nicer plot
        for(i = 0; i < ab.length; i++){
            ab[i] = Math.log10(ab[i])*20/200;
        }

        // Calculate x-Axis scaling
        // mul tells how many pixels have to be skipped after each sample
        // If the signal has more points than the canvas, this will always be 1
        // skip tells how many samples have to be skipped after each pixel
        // If the signal has less points than the canvas, this will always be 1
        var skip = 1;
        var mul = 1;
        var ratio = scope.width / ab.length * scope.scaling.x;
        if(ratio > 1){
            mul = ratio;
        } else {
            skip = 1 / ratio;
        }

        // // Position SNR markers
        scope.ctrl.setSNRMarkers(firstSNRMarker * mul / scope.width, pushed * mul / scope.width);

        // Store brush
        context.save();
        context.strokeWidth = 1;
        // Draw trace
        context.strokeStyle = this.state.color;
        context.beginPath();
        context.moveTo(0, (halfHeight - (ab[0] + traceConf.offset) * halfHeight * scope.scaling.y));
        for (i=0, j=0; (j < scope.width) && (i < ab.length - 1); i+=skip, j+=mul){
            context.lineTo(j, (halfHeight - (ab[Math.floor(i)] + traceConf.offset) * halfHeight * scope.scaling.y));
        }
        // Fix drawing on canvas
        context.stroke();

        // Draw mover to move the trace
        context.fillStyle = this.state.color;
        offset = this.state.offset;
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
    }
};
