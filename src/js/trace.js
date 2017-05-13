function miniFFT(re, im) {
    var N = re.length;
    var i;
    var j;
    var h;
    var k;
    for (i = 0; i < N; i++) {
        for(j = 0, h = i, k = N; k >>= 1; h >>= 1){
            j = (j << 1) | (h & 1);
        }
        if (j > i) {
            re[j] = [re[i], re[i] = re[j]][0];
            im[j] = [im[i], im[i] = im[j]][0];
        }
    }
    for(var hN = 1; hN * 2 <= N; hN *= 2){
        for (i = 0; i < N; i += hN * 2){
            for (j = i; j < i + hN; j++) {
                var cos = Math.cos(Math.PI * (j - i) / hN);
                var sin = Math.sin(Math.PI * (j - i) / hN);
                var tre =  re[j+hN] * cos + im[j+hN] * sin;
                var tim = -re[j+hN] * sin + im[j+hN] * cos;
                re[j + hN] = re[j] - tre; im[j + hN] = im[j] - tim;
                re[j] += tre; im[j] += tim;
            }
        }
    }
}

// Creates a new trace
export const  NormalTrace = function (state) {
    // Remember trace state
    this.state = state;

    // Assign class variables
    this.on = true;

    // Create the data buffer
    
    if(state.source.node && state.source.node.ctrl.ready) {
        if(this.state.source.node.type != 'WebsocketSource'){
            this.data = new Float32Array(state.source.node.ctrl.analyzer.frequencyBinCount);
        } else {
            this.data = new Float32Array(state.source.frameSize);
        }
    }
    this.fetched = false;
};

NormalTrace.prototype.initGL = function(){
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
NormalTrace.prototype.draw = function (canvas, scope, traceConf, triggerLocation) {
    var context = canvas.getContext('2d');
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
        if(this.state.source.node.type != 'WebsocketSource'){
            this.data = new Float32Array(state.source.node.ctrl.analyzer.frequencyBinCount);
        } else {
            this.data = new Float32Array(state.source.frameSize);
        }
    }
    this.fetched = false;
};

// Preemptively fetches a new sample set
FFTrace.prototype.fetch = function () {
    if(!this.fetched && this.state.source.node && this.state.source.node.ctrl.ready){
        if(this.state.source.node.type != 'WebsocketSource'){
            if(!this.data){
                this.data = new Float32Array(this.state.source.node.ctrl.analyzer.frequencyBinCount);
            }
            this.state.source.node.ctrl.analyzer.getFloatFrequencyData(this.data);
        } else {
            this.data = this.state.source.node.ctrl.data;
        }
        
    }
    this.fetched = true;
};

// Draws trace on the new frame
FFTrace.prototype.draw = function (canvas, scope, traceConf) {

    var i, j;
    var halfHeight = scope.height / 2;
    var context = canvas.getContext('2d');


    if(this.state.source.node.type != 'WebsocketSource'){
        var SPACING = 1;
        var BAR_WIDTH = 1;
        var numBars = Math.round(scope.width / SPACING);
        var multiplier = this.state.source.node.ctrl.analyzer.frequencyBinCount / numBars;

        // Get a new dataset
        this.fetch();

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

        var real = this.data.slice(0);
        var compl = new Float32Array(this.data.length);
        miniFFT(real, compl);
        var ab = new Float32Array(this.data.length);
        for(i = 0; i < this.data.length; i++){
            ab[i] = Math.abs(real[i]*real[i] - compl[i]*compl[i]);
            ab[i] = Math.log10(ab[i])*20/200;
        }
        // Store brush
        context.save();
        context.strokeWidth = 1;

        // Get a new dataset
        this.fetch();

        // Draw trace
        context.strokeStyle = this.state.color;
        context.beginPath();
        // Draw samples
        var skip = 1;
        var mul = 1;
        var ratio = scope.width / this.data.length * scope.scaling.x;
        if(ratio > 1){
            mul = Math.ceil(ratio);
        } else {
            skip = Math.floor(1 / ratio);
        }
        context.moveTo(0, (halfHeight - ((ab[0] + ab[1] + ab[2]) / 3 + traceConf.offset) * halfHeight * scope.scaling.y));
        for (i=0, j=0; (j < scope.width) && (i < ab.length - 1); i+=skip, j+=mul){
            context.lineTo(j, (halfHeight - ((ab[-1+i] + ab[0+i] + ab[1+i]) / 3 + traceConf.offset) * halfHeight * scope.scaling.y));
        }
        // Fix drawing on canvas
        context.stroke();

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
    }
};
