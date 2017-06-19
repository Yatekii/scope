import { miniFFT} from './math/fft.js';
import { sum, ssum } from './helpers.js';
import { applyWindow, windowFunctions } from './math/windowing.js';
import * as marker from './marker.js';

// Creates a new trace
export const  TimeTrace = function (id, state) {
    // Remember trace state
    this.state = state;
    this.id = id;

    // Init class variables
    this.on = true;
};

// Draws trace on the new frame
TimeTrace.prototype.draw = function (canvas) {
    var context = canvas.getContext('2d');
    // Store context state so other painters are presented with their known context state
    context.save();

    var scope = this.state.source.scope;

    // Half height of canvas
    var halfHeight = scope.height / 2;

    // Draw every <skip> sample in data
    var skip = 1;
    // Apply sample to every <mul> pixel on canvas
    var mul = 1;

    // Calculate ratio of number of samples to number of pixels and factor in x-scaling
    // To calculate steps in the for loop to draw the trace
    var ratio = scope.width / this.state.source.ctrl.channels[0].length * this.state.scaling.x; // pixel/sample
    if(ratio > 1){
        mul = ratio;
    } else {
        skip = 1 / ratio;
    }

    // Draw scales
    if(this.id == this.state.source.activeTrace){
        // Draw horizontal scales
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = "30px Arial";
        context.fillStyle = 'blue';

        var nStart = 1e18;
        var n = 1e18;
        var dt = ratio / this.state.source.samplingRate * n;
        for(var a = 0; a < 20; a++){
            if(scope.width / dt > 1 && scope.width / dt < 11){
                break;
            }
            n *= 1e-1;
            dt = ratio / this.state.source.samplingRate * n;
        }

        this.state.info.deltat = (1 / ratio * dt * 1 / this.state.source.samplingRate).toFixed(15);

        var i;
        for(i = 0; i < 11; i++){
            context.save();
            context.setLineDash([5]);
            context.strokeStyle = 'rgba(171,171,171,' + (1 / (scope.width / dt)) + ')';
            for(var j = 1; j < 10; j++){
                context.beginPath();
                context.moveTo(dt * i + dt / 10 * j, 0);
                context.lineTo(dt * i + dt / 10 * j, scope.height);
                context.stroke();
            }
            context.restore();
            context.beginPath();
            context.moveTo(dt * i, 0);
            context.lineTo(dt * i, scope.height);
            context.stroke();
        }
        context.restore();

        // Draw vertical scales
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = "30px Arial";
        context.fillStyle = 'blue';

        n = 1;
        var dA = this.state.scaling.y;
        for(a = 0; a < 20; a++){
            if(scope.height * 0.5 / dA > 1 && scope.height * 0.5 / dA < 6){
                break;
            }
            n *= 5;
            dA = this.state.scaling.y * n;
        }
        // dA
        this.state.info.deltaA = (n * (this.state.source.bits - 1) * this.state.source.vpb).toFixed(15);

        var i;
        for(i = -6; i < 6; i++){
            context.save();
            context.setLineDash([5]);
            context.strokeStyle = 'rgba(171,171,171,' + (1 / (scope.height / dA)) + ')';
            for(var j = 1; j < 10; j++){
                context.beginPath();
                context.moveTo(0, 0.5 * scope.height + dA * i + dA / 10 * j);
                context.lineTo(scope.width, 0.5 * scope.height + dA * i + dA / 10 * j);
                context.stroke();
            }
            context.restore();
            context.beginPath();
            context.moveTo(0, 0.5 * scope.height + dA * i);
            context.lineTo(scope.width, 0.5 * scope.height + dA * i);
            context.stroke();
        }
        context.restore();
    }

    // Draw trace
    context.strokeWidth = 1;
    context.strokeStyle = this.state.color;
    context.beginPath();

    // Actually draw the trace, starting at pixel 0 and data point at 0
    // triggerLocation is only relevant when using WebAudio
    // using an external source the source handles triggering
    context.moveTo(0, (halfHeight - (this.state.source.ctrl.channels[0][0] + this.state.offset) * halfHeight * this.state.scaling.y));
    for (var i=0, j=0; (j < scope.width) && (i < this.state.source.ctrl.channels[0].length); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (this.state.source.ctrl.channels[0][Math.floor(i)] + this.state.offset) * halfHeight * this.state.scaling.y));
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
        halfHeight - this.state.offset * halfHeight * this.state.scaling.y - scope.ui.mover.height / 2,
        scope.ui.mover.width,
        scope.ui.mover.height
    );

    // Draw trigger location
    context.fillStyle = 'white';
    var trgMiddle = scope.width * scope.source.triggerPosition;
    context.beginPath();
    context.moveTo(trgMiddle, scope.height - 15);
    context.lineTo(trgMiddle + 15, scope.height);
    context.lineTo(trgMiddle - 15, scope.height);
    context.fill();

    // Restore canvas context for next painter
    context.restore();
};

// Creates a new source
export const FFTrace = function(id, state) {
    // Remember trace state
    this.state = state;
    this.id = id;

    // Init class variables
    this.on = true;
};

// Draws trace on the new frame
FFTrace.prototype.draw = function (canvas) {
    var me = this;
    var i, j;
    var scope = this.state.source.scope;
    var halfHeight = scope.height / 2;
    var context = canvas.getContext('2d');

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
    var ratio = scope.width / ab.length * this.state.scaling.x; // pixel / sample
    if(ratio > 1){
        mul = ratio;
    } else {
        skip = 1 / ratio;
    }

    // Calculate SNR
    if(this.state.SNRmode == 'manual'){
        var ss = 0;
        var sn = 0;
        var first = this.getMarkerById('SNRfirst')[0].x / ab.length;
        var second = this.getMarkerById('SNRsecond')[0].x / ab.length;
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
        this.setSNRMarkers(firstSNRMarker / ab.length, secondSNRMarker / ab.length);
    }

    this.state.markers.forEach(function(m) {
        marker.draw(context, me.state.source.scope, m, ratio, ab.length);
    });

    // Convert spectral density to a logarithmic scale to be able to better plot it.
    // Scale it down by 200 for a nicer plot
    for(i = 0; i < ab.length; i++){
        ab[i] = Math.log10(ab[i])*20/200;
    }

    // Store brush
    context.save();
    if(this.id == this.state.source.activeTrace){
        // Draw horizontal scales
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = "30px Arial";
        context.fillStyle = 'blue';

        var unit = 1e9
        var nStart = 1;
        var n = 1;
        var df = ratio * this.state.source.samplingRate / 2 * n;
        for(var a = 0; a < 20; a++){
            if(scope.width / df > 1 && scope.width / df < 11){
                break;
            }
            n *= 1e-1;
            df = ratio * this.state.source.samplingRate / 2 * n;
        }

        // df
        this.state.info.deltaf = (1 / ratio * df * this.state.source.samplingRate / this.state.source.frameSize).toFixed(15);

        var i;
        for(i = 0; i < 11; i++){
            context.save();
            context.setLineDash([5]);
            context.strokeStyle = 'rgba(171,171,171,' + (1 / (scope.width / df)) + ')';
            for(var j = 1; j < 10; j++){
                context.beginPath();
                context.moveTo(df * i + df / 10 * j, 0);
                context.lineTo(df * i + df / 10 * j, scope.height);
                context.stroke();
            }
            context.restore();
            context.beginPath();
            context.moveTo(df * i, 0);
            context.lineTo(df * i, scope.height);
            context.stroke();
        }
        context.restore();
    }
    context.strokeWidth = 1;
    // Draw trace
    context.strokeStyle = this.state.color;
    context.beginPath();
    context.moveTo(0, (halfHeight - (ab[0] + this.state.offset) * halfHeight * this.state.scaling.y));
    for (i=0, j=0; (j < scope.width) && (i < ab.length - 1); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (ab[Math.floor(i)] + this.state.offset) * halfHeight * this.state.scaling.y));
    }
    // Fix drawing on canvas
    context.stroke();

    // Draw mover to move the trace
    context.fillStyle = this.state.color;
    var offset = this.state.offset;
    if(offset > 1){
        offset = 1;
    } else if(offset < -1){
        offset = -1;
    }
    context.fillRect(
        scope.width - scope.ui.mover.width - scope.ui.mover.horizontalPosition,
        halfHeight - this.state.offset * halfHeight * this.state.scaling.y - scope.ui.mover.height / 2,
        scope.ui.mover.width,
        scope.ui.mover.height
    );

    // Restore brush
    context.restore();

    // TODO: Draw triangle at trig loc
    var trigLoc = ratio * me.state.source.scope.triggerLoc * ab.length;

};

FFTrace.prototype.getMarkerById = function(id){
    var result = this.state.markers.filter(function( obj ) {
        return obj.id == id;
    });
    return result;
};

FFTrace.prototype.setSNRMarkers = function(firstX, secondX){
    var first = this.getMarkerById('SNRfirst');
    var second = this.getMarkerById('SNRsecond');
    if(first.length < 1){
        this.addMarker('SNRfirst', 'vertical', firstX);
    } else {
        first[0].x = firstX;
    }
    if(second.length < 1){
        this.addMarker('SNRsecond', 'vertical', secondX);
    } else {
        second[0].x = secondX;
    }
};

FFTrace.prototype.setFirstSNRMarker = function(firstX){
    var first = this.getMarkerById('SNRfirst');
    if(first.length < 1){
        this.addMarker('SNRfirst', 'vertical', firstX);
        return;
    }
    first[0].x = firstX;
};

FFTrace.prototype.setSecondSNRMarker = function(secondX){
    var second = this.getMarkerById('SNRsecond');
    if(second.length < 1){
        this.addMarker('SNRsecond', 'vertical', secondX);
        return;
    }
    second[0].x = secondX;
};