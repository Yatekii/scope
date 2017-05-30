import { miniFFT} from './math/fft.js';
import { sum, ssum } from './helpers.js';
import { applyWindow, windowFunctions } from './math/windowing.js';

// Creates a new trace
export const  NormalTrace = function (state) {
    // Remember trace state
    this.state = state;

    // Init class variables
    this.on = true;
};

// Draws trace on the new frame
NormalTrace.prototype.draw = function (canvas) {
    var context = canvas.getContext('2d');
    // Store context state so other painters are presented with their known context state
    context.save();
    context.strokeWidth = 1;

    // Draw trace
    context.strokeStyle = this.state.color;
    context.beginPath();

    var scope = this.state.source.scope;

    // Half height of canvas
    var halfHeight = scope.height / 2;

    // Draw every <skip> sample in data
    var skip = 1;
    // Apply sample to every <mul> pixel on canvas
    var mul = 1;

    // Calculate ratio of number of samples to number of pixels and factor in x-scaling
    // To calculate steps in the for loop to draw the trace
    var ratio = scope.width / this.state.source.ctrl.channels[0].length * scope.scaling.x;
    if(ratio > 1){
        mul = ratio;
    } else {
        skip = 1 / ratio;
    }

    // Actually draw the trace, starting at pixel 0 and data point at 0
    // triggerLocation is only relevant when using WebAudio
    // using an external source the source handles triggering
    context.moveTo(0, (halfHeight - (this.state.source.ctrl.channels[0][0] + this.state.offset) * halfHeight * scope.scaling.y));
    for (var i=0, j=0; (j < scope.width) && (i < this.state.source.ctrl.channels[0].length); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (this.state.source.ctrl.channels[0][Math.floor(i)] + this.state.offset) * halfHeight * scope.scaling.y));
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
        halfHeight - this.state.offset * halfHeight * scope.scaling.y - scope.ui.mover.height / 2,
        scope.ui.mover.width,
        scope.ui.mover.height
    );

    // Restore canvas context for next painter
    context.restore();
};

// Creates a new source
export const FFTrace = function(state) {
    // Remember trace state
    this.state = state;

    // Init class variables
    this.on = true;
    console.log('kek')
};

// Draws trace on the new frame
FFTrace.prototype.draw = function (canvas) {
    var i, j;
    var scope = this.state.source.scope;
    var halfHeight = scope.height / 2;
    var context = canvas.getContext('2d');

    if(false){
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
            context.fillRect(i * SPACING, -magnitude + this.state.offset * scope.height, BAR_WIDTH, scope.height + magnitude);
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
            halfHeight - this.state.offset * halfHeight * scope.scaling.y - scope.ui.mover.height / 2,
            scope.ui.mover.width,
            scope.ui.mover.height
        );

        // Restore brush
        context.restore();

        // Mark data as deprecated
        this.fetched = false;
    } else {
        // Duplicate data
        var real = this.state.source.ctrl.channels[0].slice(0);
        // Create a complex vector with zeroes sice we only have real input
        var compl = new Float32Array(this.state.source.ctrl.channels[0]);
        // Window data if a valid window was selected
        if(this.state.windowFunction && windowFunctions[this.state.windowFunction]){
            real = applyWindow(real, windowFunctions[this.state.windowFunction]);
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

        // Calculate SNR
        if(this.state.SNRmode == 'manual'){
            var ss = 0;
            var sn = 0;
            var first = scope.ctrl.getMarkerById('SNRfirst')[0].x / mul * scope.width;
            var second = scope.ctrl.getMarkerById('SNRsecond')[0].x / mul * scope.width;
            console.log(first, second)
            for(i = 1; i < ab.length; i++){
                if(i < first || i > second){
                    sn += ab[i] * ab[i];
                } else {
                    ss += ab[i] * ab[i];
                }
            }
            var SNR = Math.log10(ss / sn) * 10;
            this.state.info.SNR = SNR;
        }
        if(this.state.SNRmode == 'auto'){
            // Find max
            var max = -3000000;
            var maxi = 0;
            for(i = 1; i < ab.length; i++){
                if(ab[i] > max){
                    max = ab[i];
                    maxi = i;
                }
            }
            var m = (sum(ab.slice(0, maxi - 1)) + sum(ab.slice(maxi + 1))) / ab.length;
            var n = [];
            var s = [];
            var secondSNRMarker = 0;
            var firstSNRMarker = 0;
            // Add all values under the average and those above each to a list
            for(i = 1; i < ab.length; i++){
                if(ab[i] < m){
                    n.push(ab[i]);
                }
                else {
                    if(secondSNRMarker == 0){
                        firstSNRMarker = i - 1;
                        if(firstSNRMarker < 1){
                            firstSNRMarker = 1;
                        }
                    }
                    s.push(ab[i]);
                    secondSNRMarker = i + 1;
                    if(secondSNRMarker > ab.length){
                        secondSNRMarker = ab.length;
                    }
                }
            }
            // Sum both sets and calculate their ratio which is the SNR
            var ss = ssum(s);
            var sn = ssum(n);
            var SNR = Math.log10(ss / sn) * 10;
            this.state.info.SNR = SNR;

            // Posiion SNR markers
            scope.ctrl.setSNRMarkers(firstSNRMarker * mul / scope.width, secondSNRMarker * mul / scope.width);
            console.log(firstSNRMarker, secondSNRMarker)
         }

        // Convert spectral density to a logarithmic scale to be able to better plot it.
        // Scale it down by 200 for a nicer plot
        for(i = 0; i < ab.length; i++){
            ab[i] = Math.log10(ab[i])*20/200;
        }

        // Store brush
        context.save();
        context.strokeWidth = 1;
        // Draw trace
        context.strokeStyle = this.state.color;
        context.beginPath();
        context.moveTo(0, (halfHeight - (ab[0] + this.state.offset) * halfHeight * scope.scaling.y));
        for (i=0, j=0; (j < scope.width) && (i < ab.length - 1); i+=skip, j+=mul){
            context.lineTo(j, (halfHeight - (ab[Math.floor(i)] + this.state.offset) * halfHeight * scope.scaling.y));
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
            halfHeight - this.state.offset * halfHeight * scope.scaling.y - scope.ui.mover.height / 2,
            scope.ui.mover.width,
            scope.ui.mover.height
        );

        // Restore brush
        context.restore();

        // Mark data as deprecated
        this.fetched = false;
    }
};
