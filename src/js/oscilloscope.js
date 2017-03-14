import * as helpers from './helpers.js';
import * as marker from './marker.js';

export const Oscilloscope = function(state) {
    // Remember scope state
    this.state = state;

    // Create a new canvas to draw the scope onto
    this.canvas = document.getElementById('scope');

    this.traces = [];

    this.sources = [];

    this.markerMoving = false;
};

Oscilloscope.prototype.draw = function() {
    var me = this;

    if(this.canvas == null){
        return;
    }
    var width = this.canvas.clientWidth;
    var height = this.canvas.clientHeight;
    var context = this.canvas.getContext('2d');

    // Assign new scope properties
    this.canvas.height = this.state.height = height;
    this.canvas.width = this.state.width = width;
    this.scaling = height / 256;
    context.strokeWidth = 1;

    // Draw background
    context.fillStyle='#222222';
    context.fillRect(0, 0, width, height);

    // Draw trigger level
    context.strokeStyle = '#278BFF';
    context.beginPath();
    context.moveTo(0, height / 2 - this.triggerLevel);
    context.lineTo(width, height / 2 - this.triggerLevel);
    context.stroke();

    // this.traces[this.triggerTrace].fetch();
    // var triggerLocation = getTriggerLocation(this.traces[this.triggerTrace].data, width, this.triggerLevel, this.triggerType);
    // if(triggerLocation === undefined && this.autoTriggering){
    //     triggerLocation = 0;
    // }

    // this.traces.forEach(function(trace) {
    //     if(trace.on && trace.source !== null && trace.source.ready){
    //         trace.draw(triggerLocation);
    //     }
    // });

    me.state.markers.forEach(function(m) {
        marker.draw(context, me.state, m);
    });
};

Oscilloscope.prototype.addSource = function(source) {
    this.sources.push(source);
};

Oscilloscope.prototype.addTrace = function(trace) {
    this.traces.push(trace);
};

Oscilloscope.prototype.addMarker = function(marker) {
    this.markers.push(marker);
};

function getTriggerLocation(buf, buflen, triggerLevel, type){
    switch(type){
    case 'rising':
    default:
        return risingEdgeTrigger(buf, buflen, triggerLevel);
    case 'falling':
        return fallingEdgeTrigger(buf, buflen, triggerLevel);
    }
}

function risingEdgeTrigger(buf, buflen, triggerLevel) {
    for(var i=1; i< buflen; i++){
        if(buf[i] > 128 + triggerLevel && buf[i - 1] < 128 + triggerLevel){
            return i;
        }
    }
}

function fallingEdgeTrigger(buf, buflen, triggerLevel) {
    for(var i=1; i< buflen; i++){
        if(buf[i] < 128 + triggerLevel && buf[i - 1] > 128 + triggerLevel){
            return i;
        }
    }
}

Oscilloscope.prototype.onMouseDown = function(event, scope){
    // Start moving triggerlevel
    if(scope.canvas.height / 2 - event.offsetY < this.state.triggerLevel + 3 && scope.canvas.height / 2 - event.offsetY > this.state.triggerLevel - 3){
        scope.triggerMoving = true;
        return;
    }

    // Start moving markers
    for(var i = 0; i < this.state.markers.length; i++){
        if(this.state.markers[i].type == 'vertical'){
            if(event.offsetX < this.state.markers[i].x + 3 && event.offsetX > this.state.markers[i].x - 3){
                scope.markerMoving = i;
                return;
            }
        } else {
            if(scope.canvas.height / 2 - event.offsetY < this.state.markers[i].y + 3 && scope.canvas.height / 2 - event.offsetY > this.state.markers[i].y - 3){
                scope.markerMoving = i;
                return;
            }
        }
    }
}

Oscilloscope.prototype.onMouseUp = function(event, scope){
    // End moving triggerlevel
    if(scope.triggerMoving){
        scope.triggerMoving = false;
    }

    // Start moving markers
    if(scope.markerMoving !== false){
        scope.markerMoving = false;
    }
}

Oscilloscope.prototype.onMouseMove = function(event, scope){
    // Change cursor
    if(scope.canvas.height / 2 - event.offsetY < this.state.triggerLevel + 3 && scope.canvas.height / 2 - event.offsetY > this.state.triggerLevel - 3){
        document.body.style.cursor = 'row-resize';
    }
    else{
        var changed = false;
        for(var i = 0; i < this.state.markers.length; i++){
            if(this.state.markers[i].type == 'vertical'){
                if(event.offsetX < this.state.markers[i].x + 3 && event.offsetX > this.state.markers[i].x - 3){
                    document.body.style.cursor = 'col-resize';
                    changed = true;
                    break;
                }
            } else {
                console.log(scope.canvas.height / 2 - event.offsetY, this.state.markers[i].y + 3)

                if(scope.canvas.height / 2 - event.offsetY < this.state.markers[i].y + 3 && scope.canvas.height / 2 - event.offsetY > this.state.markers[i].y - 3){
                    document.body.style.cursor = 'row-resize';
                    changed = true;
                    break;
                }
            }
        }
        if(!changed){
            document.body.style.cursor = 'initial';
        }
    }

    // Move triggerlevel
    if(scope.triggerMoving){

        var triggerLevel = scope.canvas.height / 2 - event.offsetY;
        if(triggerLevel > scope.canvas.height / 2 - 1){
            triggerLevel = scope.canvas.height / 2 - 1;
        }
        if(triggerLevel < -scope.canvas.height / 2){
            triggerLevel = -scope.canvas.height / 2;
        }
        this.state.triggerLevel = triggerLevel;
        return;
    }

    // Move markers
    if(scope.markerMoving !== false){
        var markerLevel = 0;
        if(this.state.markers[scope.markerMoving].type == 'vertical'){
            markerLevel = event.offsetX;
            if(markerLevel > this.canvas.width){
                markerLevel = this.canvas.width;
            }
            if(markerLevel < 0){
                markerLevel = 0;
            }
            this.state.markers[scope.markerMoving].x = markerLevel;
            return;
        } else {
            markerLevel = scope.canvas.height / 2 - event.offsetY;
            if(markerLevel > scope.canvas.height / 2 - 1){
                markerLevel = scope.canvas.height / 2 - 1;
            }
            if(markerLevel < -scope.canvas.height / 2){
                markerLevel = -scope.canvas.height / 2;
            }
            this.state.markers[scope.markerMoving].y = markerLevel;
            return;
        }
    }
}
