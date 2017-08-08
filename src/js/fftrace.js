import { miniFFT} from './math/fft.js';
import { power, powerDensity } from './math/math.js';
import { applyWindow, windowFunctions } from './math/windowing.js';
import * as converting from './math/converting.js';
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
    this._data = [];
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
    var scope = this.state._source._scope;
    var halfHeight = scope.height / 2;
    var context = canvas.getContext('2d');
    var data = this._data.slice(0);
    
    // Calculate x-Axis scaling
    // mul tells how many pixels have to be skipped after each sample
    // If the signal has more points than the canvas, this will always be 1
    // skip tells how many samples have to be skipped after each pixel
    // If the signal has less points than the canvas, this will always be 1
    var skip = 1;
    var mul = 1;
    var ratio = scope.width / data.length * this.state.scaling.x; // pixel / sample
    if(ratio > 1){
        mul = ratio;
    } else {
        skip = 1 / ratio;
    }

    // Scale data by 100
    for(i = 0; i < data.length; i++){
        data[i] = data[i] / 100;
    }

    // Draw THD markers
    var f = 1000;
    var n = 10;
    
    // Draw the <n> next harmonic locations
    for(i = 1; i <= n; i++){
        context.fillStyle = 'blue';
        var sample = converting.frequencyToSample(f * i, scope.source.samplingRate / 2, data.length);
        var harmonicX = (
            (converting.sampleToPercentage(
                sample,
                data.length
            ) - this.state.offset.x
            ) * scope.width * ratio
        ) * this.state.scaling.x;
        var harmonicY = (
            halfHeight - (
                data[Math.floor(sample + this.state.offset.x * data.length)] + this.state.offset.y
            ) * halfHeight * this.state.scaling.y
        );
        context.beginPath();
        context.moveTo(harmonicX, harmonicY);
        context.lineTo(harmonicX + 15, harmonicY - 15);
        context.lineTo(harmonicX - 15, harmonicY - 15);
        context.fill();
    }

    // Store brush
    context.save();
    if(this.id == this.state._source.activeTrace){
        // Vertical grid
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = '30px Arial';
        context.fillStyle = 'blue';

        // Calculate the current vertical grid height dA according to screen size
        // Start at 1mdB grid
        const baseGrid = 1e-3;
        n = 1;
        var dA = baseGrid * halfHeight / (1) * this.state.scaling.y;
        for(a = 0; a < 20; a++){
            if(scope.height * 0.5 / dA > 1 && scope.height * 0.5 / dA < 11){
                break;
            }
            n *= 10;
            dA = baseGrid * halfHeight / (1) * this.state.scaling.y * n;
        }
        // Store vertical grid size
        // Mulitply by 100 because we scale the signal constant by that factor.
        this.state._info.deltaA = (baseGrid * n * 100);

        // Draw vertical grid
        for(i = -11; i < 11; i++){
            context.save();
            context.setLineDash([5]);
            context.strokeStyle = 'rgba(171,171,171,' + (1 / (scope.height / dA)) + ')';
            for(j = 1; j < 10; j++){
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

        // Vertical grid
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = '30px Arial';
        context.fillStyle = 'blue';

        // Calculate the current vertical grid width dF according to screen size
        n = 1;
        var df = ratio * this.state._source.samplingRate / 2 * n;
        for(var a = 0; a < 20; a++){
            if(scope.width / df > 1 && scope.width / df < 11){
                break;
            }
            n *= 1e-1;
            df = ratio * this.state._source.samplingRate / 2 * n;
        }

        // Store grid width
        this.state._info.deltaf = 1 / ratio * df * this.state._source.samplingRate / this.state._source.frameSize;

        // Draw vertical grid
        for(i = 0; i < 11; i++){
            context.save();
            context.setLineDash([5]);
            context.strokeStyle = 'rgba(171,171,171,' + (1 / (scope.width / df)) + ')';
            for(j = 1; j < 10; j++){
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
    context.moveTo(0, (halfHeight - (data[Math.floor(0 + this.state.offset.x * data.length)] + this.state.offset.y) * halfHeight * this.state.scaling.y));
    for (i=0, j=0; (j < scope.width) && (i < data.length - 1); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (data[Math.floor(i + this.state.offset.x * data.length)] + this.state.offset.y) * halfHeight * this.state.scaling.y));
    }
    // Fix drawing on canvas
    context.stroke();

    // Draw the markers
    context.save();
    this.state.markers.forEach(function(m) {
        marker.draw(context, me.state._source._scope, m, me.state, ratio, data.length);
    });
    context.restore();

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
};

FFTrace.prototype.calc = function() {
    var i, j;
    var scope = this.state._source._scope;
    var currentWindow = windowFunctions[this.state.windowFunction];
    // Duplicate data because the fft will store the results in the input vectors
    var real = this.state._source._ctrl.channels[this.state.channelID].slice(0);
    // Create a complex vector with zeroes sice we only have real input
    var compl = new Float32Array(this.state._source._ctrl.channels[this.state.channelID].length);
    // Window data if a valid window was selected
    // TODO: Uncomment again after debug
    // if(this.state.windowFunction && currentWindow){
    //     real = applyWindow(real, currentWindow.fn);
    // }
    // Do an FFT of the signal
    // The results are now stored in the input vectors
    miniFFT(real, compl);

    // Only use half of the FFT since we only need the upper half if settings say so
    if(this.state.halfSpectrum){
        // Double the halfband spectrum, but don't double the DC
        real = real.slice(0, real.length / 2 + 1);
        compl = compl.slice(0, compl.length / 2 + 1);
        for(i = 1; i < real.length; i++){
            real[i] *= 2;
            compl[i] *= 2;
        }
    }

    // Calculate the the total power of the signal
    // P = V^2
    var ab = new Float32Array(real.length);

    for(i = 0; i < ab.length; i++){
        ab[i] = real[i] * real[i] + compl[i] * compl[i];
    }

    if(ab.length > 0){
        // Set RMS
        this.state._info.RMSPower = power(ab, true, ab.length - 1);
        // Set P/f
        this.state._info.powerDensity = powerDensity(ab, scope.source.samplingRate / 2, true, ab.length - 1);

        // Calculate SNR
        if(this.state.SNRmode == 'manual'){
            var first = this.getMarkerById('SNRfirst')[0].x * ab.length;
            var second = this.getMarkerById('SNRsecond')[0].x * ab.length;

            // Sum all values in the bundle around max
            var Ps = power(ab.slice(first, second + 1), true, ab.length);
            // Sum all the other values except DC
            var Pn = power(ab.slice((second - first) / 2, first), true, ab.length)
                   + power(ab.slice(second + 1), true, ab.length);
            // Sum both sets and calculate their ratio which is the SNR
            var SNR = Math.log10(Ps / Pn) * 10;
            this.state._info.SNR = SNR;
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

            var l = Math.floor(currentWindow.lines / 2);
            // Sum all values in the bundle around max
            Ps = power(ab.slice(maxi - l, maxi + l + 1), true, ab.length);
            // Sum all the other values except DC
            Pn = power(ab.slice(l, maxi - l), true, ab.length)
                   + power(ab.slice(maxi + l + 1), true, ab.length);
            // Sum both sets and calculate their ratio which is the SNR
            SNR = Math.log10(Ps / Pn) * 10;
            this.state._info.SNR = SNR;

            // Posiion SNR markers
            this.setSNRMarkers(
                (maxi - l) / ab.length,
                (maxi + l) / ab.length
            );
        }

        // THD
        // TODO: calculate actual stuff

        var f = 1000;
        var n = 10;
        
        for(i = 1; i <= n; i++){
            var sample = converting.frequencyToSample(f * i, scope.source.samplingRate / 2, ab.length);
        }

    } else {
        this.state._info.RMSPower = '\u26A0 No signal';
        this.state._info.powerDensity  = '\u26A0 No signal';
        this.state._info.SNR = '\u26A0 No signal';
    }

    // Convert spectral density to decibels.
    for(i = 0; i < ab.length; i++){
        ab[i] = Math.log10(ab[i])*10;
    }

    this._data = ab.slice(0);
}

/*
 * Returns a marker corresponding to <id>
 * <id> : <string> : The name of the marker
 */
FFTrace.prototype.getMarkerById = function(id){
    var result = this.state.markers.filter(function( obj ) {
        return obj.id == id;
    });
    return result;
};

/*
 * Adds a new marker to the trace
 * <id> : <string> : The name of the marker
 * <type> : <string>['vertical', 'horizontal'] : The orientation of the marker
 * <xy> : <uint>[0..1] : The position of the marker
 * <active> : boolean : Tells wheter addidional data should be displayed
 */
FFTrace.prototype.addMarker = function(id, type, xy, active){
    var px = 0;
    var py = 0;
    if(type == 'horizontal'){
        py = xy;
    } else {
        px = xy;
    }
    this.state.markers.push({
        id: id, type: type, x: px, y: py, active: active
    });
    return this.state.markers[this.state.markers.length - 1];
};

/*
 * Sets the location of both SNR measurement markers
 * <firstX> : uint : Position of the first marker in samples
 * <secondX> : uint : Position of the second marker in samples
 */
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

/*
 * Sets the location of the first SNR measurement marker
 * <firstX> : uint : Position of the first marker in samples
 */
FFTrace.prototype.setFirstSNRMarker = function(firstX){
    var first = this.getMarkerById('SNRfirst');
    if(first.length < 1){
        this.addMarker('SNRfirst', 'vertical', firstX);
        return;
    }
    first[0].x = firstX;
};

/*
 * Sets the location of the second SNR measurement marker
 * <secondX> : uint : Position of the second marker in samples
 */
FFTrace.prototype.setSecondSNRMarker = function(secondX){
    var second = this.getMarkerById('SNRsecond');
    if(second.length < 1){
        this.addMarker('SNRsecond', 'vertical', secondX);
        return;
    }
    second[0].x = secondX;
};