import * as helpers from './helpers.js';
import * as marker from './marker.js';
import * as button from './button.js';

export const Oscilloscope = function(state) {
    // Remember scope state
    this.state = state;

    this.canvas = document.getElementById('scope');

    this.markerMoving = false;
    this.triggerMoving = false;
    this.traceMoving = false;
};

Oscilloscope.prototype.draw = function() {
    var me = this;

    if(this.canvas == null){
        return;
    }
    var width = this.canvas.clientWidth;
    var height = this.canvas.clientHeight;
    var halfHeight = this.state.height / 2;
    var context = this.canvas.getContext('2d');

    // Assign new scope properties
    this.canvas.height = this.state.height = height;
    this.canvas.width = this.state.width = width;
    context.strokeWidth = 1;

    // Draw background
    context.fillStyle='#222222';
    context.fillRect(0, 0, width, height);
    // Draw trigger level
    context.strokeStyle = '#278BFF';
    context.beginPath();
    context.moveTo(0, halfHeight - this.state.triggerLevel * halfHeight * this.state.scaling.y);
    context.lineTo(width, halfHeight - this.state.triggerLevel * halfHeight * this.state.scaling.y);
    context.stroke();

    if(this.state.triggerTrace && !(this.state.triggerTrace.node)){
        this.state.triggerTrace.node = helpers.getNodeByID(this.state.traces.map(function(trace){ return trace.node; }), this.state.triggerTrace.id)[0];
    }
    if(this.state.triggerTrace.node && this.state.triggerTrace.node.ctrl.ready){
        this.state.triggerTrace.node.ctrl.fetch();
        var triggerLocation = getTriggerLocation(this.state.triggerTrace.node.ctrl.data, width, this.state.triggerLevel, this.state.triggerType);
        if(triggerLocation === undefined && this.state.autoTriggering){
            triggerLocation = 0;
        }
    } else {
        triggerLocation = 0;
    }
    if(this.state.traces){
        this.state.traces.forEach(function(trace) {
            if(trace.node && trace.node.ctrl && trace.node.ctrl.on && trace.node.source && trace.node.source.node && trace.node.source.node.ctrl.ready){
                trace.node.ctrl.draw(me.canvas, me.state, trace, 0); // TODO: triggering
            }
        });
    }

    me.state.markers.forEach(function(m) {
        marker.draw(context, me.state, m);
    });

    me.state.buttons.forEach(function(b) {
        button.draw(context, me.state, b);
    });
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

Oscilloscope.prototype.onMouseDown = function(event){
    // Start moving triggerlevel
    var halfHeight = this.canvas.height / 2;
    var triggerLevel = this.state.triggerLevel * halfHeight * this.state.scaling.y;
    if(halfHeight - event.offsetY < triggerLevel + 3 && halfHeight - event.offsetY > triggerLevel - 3){
        this.triggerMoving = true;
        return;
    }

    // Start moving markers
    for(var i = 0; i < this.state.markers.length; i++){
        if(this.state.markers[i].type == 'vertical'){
            var x = this.state.markers[i].x * this.canvas.width;
            if(event.offsetX < x + 3 && event.offsetX > x - 3){
                this.markerMoving = i;
                return;
            }
        } else {
            var y = this.state.markers[i].y * halfHeight * this.state.scaling.y;
            if(halfHeight - event.offsetY < y + 3 && halfHeight - event.offsetY > y - 3){
                this.markerMoving = i;
                return;
            }
        }
    }

    // Start moving traces
    var me = this;
    var halfMoverWidth = me.state.ui.mover.width / 2;
    var halfMoverHeight = me.state.ui.mover.height / 2;
    this.state.traces.forEach(function(trace) {
        var x = me.canvas.width - me.state.ui.mover.horizontalPosition - halfMoverWidth;
        if(event.offsetX < x + halfMoverWidth && event.offsetX > x - halfMoverWidth){
            var y = trace.offset * halfHeight * me.state.scaling.y;
            if(halfHeight - event.offsetY < y + halfMoverHeight && halfHeight - event.offsetY > y - halfMoverHeight){
                me.traceMoving = trace;
                return;
            }
        }
    });
};

Oscilloscope.prototype.onMouseUp = function(event){
    var me = this;
    // End moving triggerlevel
    if(this.triggerMoving){
        this.triggerMoving = false;
    }

    // End moving markers
    if(this.markerMoving !== false){
        this.markerMoving = false;
    }

    // End moving traces
    if(this.traceMoving !== false){
        this.traceMoving = false;
    }

    if(this.state.buttons){
        this.state.buttons.forEach(function(button) {
            var w = button.width;
            var h = button.height;
            var x = button.left;
            var y = button.top;
            if(event.offsetX < x + w && event.offsetX > x){
                if(event.offsetY < y + h && event.offsetY > y){
                    me.state.traces.forEach(function(t){
                        if(t.node.source.node.ctrl.single){
                            t.node.source.node.ctrl.single();
                        }
                    });
                }
            }
        });
    }
};

Oscilloscope.prototype.onMouseMove = function(event){
    var halfHeight = this.canvas.height / 2;
    var halfMoverWidth = this.state.ui.mover.width / 2;
    var halfMoverHeight = this.state.ui.mover.height / 2;
    var triggerLevel = this.state.triggerLevel * halfHeight * this.state.scaling.y;
    var cursorSet = false;

    // Change cursor if trigger set
    if(halfHeight - event.offsetY < triggerLevel + 3 && halfHeight - event.offsetY > triggerLevel - 3){
        document.body.style.cursor = 'row-resize';
        cursorSet = true;
    }
    // Change cursor if marker set
    if(!cursorSet){
        for(var i = 0; i < this.state.markers.length; i++){
            if(this.state.markers[i].type == 'vertical'){
                var x = this.state.markers[i].x * this.canvas.width;
                if(event.offsetX < x + 3 && event.offsetX > x - 3){
                    document.body.style.cursor = 'col-resize';
                    cursorSet = true;
                    break;
                }
            } else {
                var y = this.state.markers[i].y * halfHeight * this.state.scaling.y;
                if(halfHeight - event.offsetY < y + 3 && halfHeight - event.offsetY > y - 3){
                    document.body.style.cursor = 'row-resize';
                    cursorSet = true;
                    break;
                }
            }
        }
    }
    // Change cursor if trace set
    if(!cursorSet){
        var me = this;
        this.state.traces.forEach(function(trace) {
            var x = me.canvas.width - me.state.ui.mover.horizontalPosition - halfMoverWidth;
            if(event.offsetX < x + halfMoverWidth && event.offsetX > x - halfMoverWidth){
                var y = trace.offset * halfHeight * me.state.scaling.y;
                if(halfHeight - event.offsetY < y + halfMoverHeight && halfHeight - event.offsetY > y - halfMoverHeight){
                    document.body.style.cursor = 'move';
                    cursorSet = true;
                    return;
                }
            }
        });
    }
    // Change cursor if nothing set
    if(!cursorSet){
        document.body.style.cursor = 'initial';
    }


    // Move triggerlevel
    if(this.triggerMoving){
        triggerLevel = (halfHeight - event.offsetY) / (halfHeight * this.state.scaling.y);
        if(triggerLevel > 1){
            triggerLevel = 1;
        }
        if(triggerLevel < -1){
            triggerLevel = -1;
        }
        this.state.triggerLevel = triggerLevel;
        return;
    }

    // Move markers
    if(this.markerMoving !== false){
        var markerLevel = 0;
        if(this.state.markers[this.markerMoving].type == 'vertical'){
            markerLevel = event.offsetX / this.canvas.width;
            if(markerLevel > 1){
                markerLevel = 1;
            }
            if(markerLevel < 0){
                markerLevel = 0;
            }
            this.state.markers[this.markerMoving].x = markerLevel;
            return;
        } else {
            markerLevel = (halfHeight - event.offsetY) / (halfHeight * this.state.scaling.y);
            if(markerLevel > 1){
                markerLevel = 1;
            }
            if(markerLevel < -1){
                markerLevel = -1;
            }
            this.state.markers[this.markerMoving].y = markerLevel;
            return;
        }
    }

    // Move traces
    if(this.traceMoving !== false){
        var traceOffset = (halfHeight - event.offsetY) / (halfHeight * this.state.scaling.y);
        if(traceOffset > 1){
            traceOffset = 1;
        }
        if(traceOffset < -1){
            traceOffset = -1;
        }
        this.traceMoving.offset = traceOffset;
        return;
    }
};

Oscilloscope.prototype.onScroll = function(event){
    this.state.scaling.y += event.wheelDeltaY * 0.01;
    if(this.state.scaling.y < 0){
        this.state.scaling.y = 0;
    }
    this.state.scaling.x += event.wheelDeltaX * 0.01;
    if(this.state.scaling.x < 1){
        this.state.scaling.x = 1;
    }
};