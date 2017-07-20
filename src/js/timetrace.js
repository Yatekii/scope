/*
 * Trace constructor
 * Constructs a new TimeTrace
 * A TimeTrace is a simple lineplot of all the recorded time samples.
 * <id> : uint : Unique trace id, which is assigned when loading a trace
 * <state> : uint : The state of the trace, which is automatically assigned when loading a trace
 */
export const  TimeTrace = function (id, state) {
    // Remember trace state
    this.state = state;
    this.id = id;

    // Init class variables
    this.on = true;
};

/*
 * Draw handler
 * The draw handler gets called once every frame and displays the current set of samples.
 * <canvas> : Canvas : the canvas to draw the samples on
 */
TimeTrace.prototype.draw = function (canvas) {
    var i, j, a;
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
    var ratio = scope.width / this.state.source.ctrl.channels[this.state.channelID].length * this.state.scaling.x; // pixel/sample
    if(ratio > 1){
        mul = ratio;
    } else {
        skip = 1 / ratio;
    }

    if(this.id == this.state.source.activeTrace){
        // Horizontal grid
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = '30px Arial';
        context.fillStyle = 'blue';

        // Calculate the current horizontal grid width dt according to screen size
        var n = 1e18;
        var dt = ratio / this.state.source.samplingRate * n;
        for(a = 0; a < 20; a++){
            if(scope.width / dt > 1 && scope.width / dt < 11){
                break;
            }
            n *= 1e-1;
            dt = ratio / this.state.source.samplingRate * n;
        }

        // Store grid width
        this.state.info.deltat = (1 / ratio * dt * 1 / this.state.source.samplingRate).toFixed(15);

        // Draw horizontal grid
        for(i = 0; i < 11; i++){
            context.save();
            context.setLineDash([5]);
            context.strokeStyle = 'rgba(171,171,171,' + (1 / (scope.width / dt)) + ')';
            for(j = 1; j < 10; j++){
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

        // Vertical grid
        context.strokeWidth = 1;
        context.strokeStyle = '#ABABAB';
        context.font = '30px Arial';
        context.fillStyle = 'blue';

        // Calculate the current vertical grid height dA according to screen size
        // Start at 1mV grid
        const baseGrid = 1e-3;
        n = 1;
        var dA = baseGrid * halfHeight / (scope.source.vpp / 2) * this.state.scaling.y;
        for(a = 0; a < 20; a++){
            if(scope.height * 0.5 / dA > 1 && scope.height * 0.5 / dA < 11){
                break;
            }
            n *= 10;
            dA = baseGrid * halfHeight / (scope.source.vpp / 2) * this.state.scaling.y * n;
        }
        // Store vertical grid size
        // vpp / canvas = v * scaling / px
        // px = v * scaling * canvas
        // da = px / dec
        // da = v * scaling * canvas / dec
        // da / canvas / scaling = v / dec
        // v / dec = n / canvas
        this.state.info.deltaA = (baseGrid * n).toFixed(15);

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
    }

    // Draw trace
    context.strokeWidth = 1;
    context.strokeStyle = this.state.color;
    context.beginPath();

    // Actually draw the trace, starting at pixel 0 and data point at 0
    // triggerLocation is only relevant when using WebAudio
    // using an external source the source handles triggering
    var data = this.state.source.ctrl.channels[this.state.channelID];
    context.moveTo(0, (halfHeight - (data[0 + this.state.offset.x * data.length] + this.state.offset.y) * halfHeight * this.state.scaling.y));
    for (i=0, j=0; (j < scope.width) && (i < data.length); i+=skip, j+=mul){
        context.lineTo(j, (halfHeight - (data[Math.floor(i + this.state.offset.x * data.length)] + this.state.offset.y) * halfHeight * this.state.scaling.y));
    }
    context.stroke();

    // Draw mover (grab and draw to move the trace)
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

    // Draw trigger location
    context.fillStyle = 'white';
    var trgLoc = (scope.width * (scope.source.triggerPosition - this.state.offset.x * ratio)) * this.state.scaling.x;
    context.beginPath();
    context.moveTo(trgLoc, scope.height - 15);
    context.lineTo(trgLoc + 15, scope.height);
    context.lineTo(trgLoc - 15, scope.height);
    context.fill();

    // Restore canvas context for next painter
    context.restore();
};