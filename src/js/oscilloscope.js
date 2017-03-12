import * as helpers from './helpers.js';
import * as marker from './marker.js';

export const Oscilloscope = function(container, width, height) {
    var me = this;

    // Create a new canvas to draw the scope onto
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = width; 
    this.canvas.style.height = height; 
    this.canvas.id = 'scope';
    // If a parent container was specified use it, otherwise just use the document body
    if(container) {
        container.appendChild(this.canvas);
    } else {
        document.body.appendChild(this.canvas);
    }

    // Create HTML representation
    var tr = createOscilloscopeRepr('oscilloscope-title-' + 0, 'oscilloscope-switch-' + 0);
    var repr = helpers.initRepr(tr, document.getElementById('node-tree-canvas')); // TODO: proper container selection
    this.repr = repr;
    repr.controller = this;
    this.repr.id = 'oscilloscope-' + 0;

    this.canvas.onmousedown = function(event){onMouseDown(event, me);};
    this.canvas.onmouseup = function(event){onMouseUp(event, me);};
    this.canvas.onmousemove = function(event){onMouseMove(event, me);};

    this.triggerLevel = 50;
    this.traces = [];

    this.sources = [];

    this.markers = [];
    this.markers.push(
        new marker.Marker(this, 'horizontal', 80),
        new marker.Marker(this, 'vertical', 200)
    );

    this.markerMoving = false;

    this.autoTriggering = true;
    this.triggerMoving = false;
    this.triggerTrace = 0;
    this.triggerType = 'rising';
};

Oscilloscope.prototype.draw = function() {
    // Make life easier with shorter variables
    var width = this.canvas.clientWidth;
    var height = this.canvas.clientHeight;
    var context = this.canvas.getContext('2d');

    // Assign new scope properties
    this.canvas.height = height;
    this.canvas.width = width;
    this.scaling = height / 256;
    context.strokeWidth = 1;

    // Draw background
    context.fillStyle='#222222';
    context.fillRect(0, 0, width, height);

    // Draw trigger level
    context.strokeStyle = '#278BFF';
    context.beginPath();
    context.moveTo(0, 128 - this.triggerLevel);
    context.lineTo(width, 128 - this.triggerLevel);
    context.stroke();

    this.traces[this.triggerTrace].fetch();
    var triggerLocation = getTriggerLocation(this.traces[this.triggerTrace].data, width, this.triggerLevel, this.triggerType);
    if(triggerLocation === undefined && this.autoTriggering){
        triggerLocation = 0;
    }

    this.traces.forEach(function(trace) {
        if(trace.on && trace.source !== null && trace.source.ready){
            trace.draw(triggerLocation);
        }
    });

    this.markers.forEach(function(marker) {
        marker.draw();
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

// Instantiates the GUI representation
function createOscilloscopeRepr(title_id) {
    return `<div class="mdl-shadow--2dp trace-card">
        <div class="mdl-card__title">
            <i class="material-icons trace-card-icon">keyboard_tab</i>&nbsp;
            <div class="mdl-textfield mdl-js-textfield">
                <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                <label class="mdl-textfield__label" for="${ title_id }">Oscilloscope</label>
            </div>
        </div>
    </div>`;
}

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

function onMouseDown(event, scope){
    // Start moving triggerlevel
    if(128 - event.offsetY < scope.triggerLevel + 3 && 128 - event.offsetY > scope.triggerLevel - 3){
        scope.triggerMoving = true;
        return;
    }

    // Start moving markers
    for(var i = 0; i < scope.markers.length; i++){
        if(scope.markers[i].x != null){
            if(event.offsetX < scope.markers[i].x + 3 && event.offsetX > scope.markers[i].x - 3){
                scope.markerMoving = i;
                return;
            }
        } else {
            if(128 - event.offsetY < scope.markers[i].y + 3 && 128 - event.offsetY > scope.markers[i].y - 3){
                scope.markerMoving = i;
                return;
            }
        }
    }
}

function onMouseUp(event, scope){
    // End moving triggerlevel
    if(scope.triggerMoving){
        scope.triggerMoving = false;
    }

    // Start moving markers
    if(scope.markerMoving !== false){
        scope.markerMoving = false;
    }
}

function onMouseMove(event, scope){
    // Change cursor
    if(128 - event.offsetY < scope.triggerLevel + 3 && 128 - event.offsetY > scope.triggerLevel - 3){
        document.body.style.cursor = 'row-resize';
    }
    else{
        var changed = false;
        for(var i = 0; i < scope.markers.length; i++){
            if(scope.markers[i].x != null){
                if(event.offsetX < scope.markers[i].x + 3 && event.offsetX > scope.markers[i].x - 3){
                    document.body.style.cursor = 'col-resize';
                    changed = true;
                    break;
                }
            } else {
                if(128 - event.offsetY < scope.markers[i].y + 3 && 128 - event.offsetY > scope.markers[i].y - 3){
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

        var triggerLevel = 128 - event.offsetY;
        if(triggerLevel > 127){
            triggerLevel = 127;
        }
        if(triggerLevel < -128){
            triggerLevel = -128;
        }
        scope.triggerLevel = triggerLevel;
        return;
    }

    // Move markers
    if(scope.markerMoving !== false){
        var markerLevel = 0;
        if(scope.markers[scope.markerMoving].x != null){
            markerLevel = event.offsetX;
            if(markerLevel > scope.canvas.width){
                markerLevel = scope.canvas.width;
            }
            if(markerLevel < 0){
                markerLevel = 0;
            }
            scope.markers[scope.markerMoving].x = markerLevel;
            return;
        } else {
            markerLevel = 128 - event.offsetY;
            if(markerLevel > 127){
                markerLevel = 127;
            }
            if(markerLevel < -128){
                markerLevel = -128;
            }
            scope.markers[scope.markerMoving].y = markerLevel;
            return;
        }
    }
}
