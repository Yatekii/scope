import { miniFFT} from './math/fft.js';
import { sum, ssum, rms } from './math/math.js';
import { applyWindow, windowFunctions } from './math/windowing.js';
import * as marker from './marker.js';

/*
 * Trace constructor
 * Constructs a new FFTrace
 * An FFTrace is a simple lineplot of all the calculated samples in the frequency domain.
 * A window can be applied and several measurements such as SNR and Signal RMS can be done.
 * <id> : uint : Unique trace id, which is assigned when loading a trace
 * <state> : uint : The state of the trace, which is automatically assigned when loading a trace
 */
export const FFTrace = function(id, state) {
    // Remember trace state
    this.state = state;
    this.id = id;

    // Init class variables
    this.on = true;
};

/*
 * Draw handler
 * The draw handler gets called once every frame and displays the current set of samples.
 * It also does all the transformations and calculations.
 * <canvas> : Canvas : the canvas to draw the samples on
 */
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

    // Only use half of the FFT since we only need the upper half if settings say so
    if(this.state.halfSpectrum){
        real = real.slice(0, real.length / 2);
        compl = compl.slice(0, compl.length / 2);
    }

    // Calculate the the total power of the signal
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

    if(ab.length > 0){
        // Set RMS
        this.state.info.RMSPower = sum(ab) / scope.source.samplingRate * (this.state.halfSpectrum ? 2 : 1);

        // Calculate SNR
        if(this.state.SNRmode == 'manual'){
            var ss = 0;
            var sn = 0;
            var first = this.getMarkerById('SNRfirst')[0].x / ab.length;
            var second = this.getMarkerById('SNRsecond')[0].x / ab.length;

            // Add up all values between the markers and those around each
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
            // Find max in all values
            var max = -3000000;
            var maxi = 0;
            for(i = 1; i < ab.length; i++){
                if(ab[i] > max){
                    max = ab[i];
                    maxi = i;
                }
            }

            // Calculate sum around max
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
    } else {
        this.state.info.RMSPower = '\u26A0 No signal';
        this.state.info.SNR = '\u26A0 No signal';
    }

    // Draw the markers
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
        // Horizontal grid
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = "30px Arial";
        context.fillStyle = 'blue';

        // Calculate the current horizontal grid width dt according to screen size
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

        // Store grid width
        this.state.info.deltaf = (1 / ratio * df * this.state.source.samplingRate / this.state.source.frameSize).toFixed(15);

        // Draw horizontal grid
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
    context.moveTo(0, (halfHeight - (ab[0 + this.state.offset.x] + this.state.offset.y) * halfHeight * this.state.scaling.y));
    for (i=0, j=0; (j < scope.width) && (i < ab.length - 1); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (ab[Math.floor(i) + this.state.offset.x] + this.state.offset.y) * halfHeight * this.state.scaling.y));
    }
    // Fix drawing on canvas
    context.stroke();

    // Draw mover to move the trace
    context.fillStyle = this.state.color;
    var offsetY = this.state.offset.y;
    if(offsetY > 1){
        offsetY = 1;
    } else if(offsetY < -1){
        offsetY = -1;
    }
    context.fillRect(
        scope.width - scope.ui.mover.width - scope.ui.mover.horizontalPosition,
        halfHeight - offsetY * halfHeight * this.state.scaling.y - scope.ui.mover.height / 2,
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