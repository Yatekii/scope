import * as helpers from './helpers.js';
import * as converting from './math/converting.js';

export const Oscilloscope = function(state) {
    // Remember scope state
    this.state = state;

    this.canvas = document.getElementById('scope');

    this.markerMoving = false;
    this.triggerMoving = false;
    this.traceMovingY = false;
    this.traceMovingX = false;
};

Oscilloscope.prototype.draw = function() {
    var me = this;

    if(this.canvas == null){
        return;
    }

    var width = document.body.clientWidth - (me.state.ui.prefPane.open ? me.state.ui.prefPane.width : 0);
    var height = document.body.clientHeight;
    var halfHeight = this.state.height / 2;
    var context = this.canvas.getContext('2d');
    var activeTrace = this.state.source.traces[this.state.source.activeTrace];

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
    context.moveTo(0, halfHeight - this.state.source.trigger.level * halfHeight * activeTrace.scaling.y);
    context.lineTo(width, halfHeight - this.state.source.trigger.level * halfHeight * activeTrace.scaling.y);
    context.stroke();

    if(this.state.source.ctrl.ready){
        this.state.source.traces.forEach(function(trace) {
                trace.ctrl.draw(me.canvas);
        });
    }
};

Oscilloscope.prototype.onMouseDown = function(event){
    // Start moving triggerlevel
    // TODO: adjust trigger level setup to be dependant on active trace
    var me = this;
    var activeTrace = this.state.source.traces[this.state.source.activeTrace];
    var halfHeight = this.canvas.height / 2;
    var triggerLevel = this.state.source.trigger.level * halfHeight * activeTrace.scaling.y;
    if(halfHeight - event.offsetY < triggerLevel + 3 && halfHeight - event.offsetY > triggerLevel - 3){
        this.triggerMoving = true;
        return;
    }

    // Start moving markers
    this.state.source.traces.forEach(function(trace){
        trace.markers && trace.markers.forEach(function(marker){
            if(marker.type == 'vertical'){
                var x = marker.x * me.canvas.width;
                if(event.offsetX < x + 3 && event.offsetX > x - 3){
                    me.markerMoving = marker;
                    return;
                }
            } else {
                var y = marker.y * halfHeight * activeTrace.scaling.y;
                if(halfHeight - event.offsetY < y + 3 && halfHeight - event.offsetY > y - 3){
                    me.markerMoving = marker;
                    return;
                }
            }
        });
    });

    // Start moving traces
    var me = this;
    var halfMoverWidth = me.state.ui.mover.width / 2;
    var halfMoverHeight = me.state.ui.mover.height / 2;
    this.state.source.traces.forEach(function(trace) {
        var x = me.canvas.width - me.state.ui.mover.horizontalPosition - halfMoverWidth;
        if(event.offsetX < x + halfMoverWidth && event.offsetX > x - halfMoverWidth){
            var y = trace.offset.y * halfHeight * activeTrace.scaling.y;
            if(halfHeight - event.offsetY < y + halfMoverHeight && halfHeight - event.offsetY > y - halfMoverHeight){
                me.traceMovingY = trace;
                return;
            }
        }
    });

    // If we didnd't start moving a trace already, we start moving in X direction
    me.traceMovingX = activeTrace;
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

    // End moving traces Y
    if(this.traceMovingY !== false){
        this.traceMovingY = false;
    }

    // End moving traces X
    if(this.traceMovingX !== false){
        this.traceMovingX = false;
    }
};

Oscilloscope.prototype.onMouseMove = function(event){
    var me = this;
    var activeTrace = this.state.source.traces[this.state.source.activeTrace];
    var halfHeight = this.canvas.height / 2;
    var halfMoverWidth = this.state.ui.mover.width / 2;
    var halfMoverHeight = this.state.ui.mover.height / 2;
    var triggerLevel = this.state.source.trigger.level * halfHeight * activeTrace.scaling.y;
    var cursorSet = false;

    // Change cursor if trigger set is active
    if(halfHeight - event.offsetY < triggerLevel + 3 && halfHeight - event.offsetY > triggerLevel - 3){
        document.body.style.cursor = 'row-resize';
        cursorSet = true;
    }
    // Change cursor if marker set is active
    if(!cursorSet){
        this.state.source.traces.forEach(function(trace){
            trace.markers && trace.markers.forEach(function(marker){
                if(marker.type == 'vertical'){
                    var x = marker.x * me.canvas.width;
                    if(event.offsetX < x + 3 && event.offsetX > x - 3){
                        document.body.style.cursor = 'col-resize';
                        cursorSet = true;
                        return;
                    }
                } else {
                    var y = marker.y * halfHeight * activeTrace.scaling.y;
                    if(halfHeight - event.offsetY < y + 3 && halfHeight - event.offsetY > y - 3){
                        document.body.style.cursor = 'row-resize';
                        cursorSet = true;
                        return;
                    }
                }
            });
        });
    }
    // Change cursor if trace set is active
    if(!cursorSet){
        var me = this;
        this.state.source.traces.forEach(function(trace) {
            var x = me.canvas.width - me.state.ui.mover.horizontalPosition - halfMoverWidth;
            if(event.offsetX < x + halfMoverWidth && event.offsetX > x - halfMoverWidth){
                var y = trace.offset.y * halfHeight * activeTrace.scaling.y;
                if(halfHeight - event.offsetY < y + halfMoverHeight && halfHeight - event.offsetY > y - halfMoverHeight){
                    document.body.style.cursor = 'move';
                    cursorSet = true;
                    return;
                }
            }
        });
    }
    // Change cursor if nothing set is active
    if(!cursorSet){
        document.body.style.cursor = 'initial';
    }


    // Move triggerlevel is active
    if(this.triggerMoving){
        triggerLevel = (halfHeight - event.offsetY) / (halfHeight * activeTrace.scaling.y);
        if(triggerLevel > 1){
            triggerLevel = 1;
        }
        if(triggerLevel < -1){
            triggerLevel = -1;
        }
        this.state.source.trigger.level = triggerLevel;
        return;
    }

    // Move markers if move markers is active
    if(this.markerMoving !== false){
        var markerLevel = 0;
        if(this.markerMoving.type == 'vertical'){
            markerLevel = event.offsetX / this.canvas.width;
            if(markerLevel > 1){
                markerLevel = 1;
            }
            if(markerLevel < 0){
                markerLevel = 0;
            }
            this.markerMoving.x = markerLevel;
            return;
        } else {
            markerLevel = (halfHeight - event.offsetY) / (halfHeight * activeTrace.scaling.y);
            if(markerLevel > 1){
                markerLevel = 1;
            }
            if(markerLevel < -1){
                markerLevel = -1;
            }
            this.markerMoving.y = markerLevel;
            return;
        }
    }

    // Move traces if move traces is active
    if(this.traceMovingY !== false){
        var traceOffset = (halfHeight - event.offsetY) / (halfHeight * activeTrace.scaling.y);
        if(traceOffset > 1){
            traceOffset = 1;
        }
        if(traceOffset < -1){
            traceOffset = -1;
        }
        this.traceMovingY.offset.y = traceOffset;
        return;
    }

    if(this.traceMovingX !== false){
        this.traceMovingX.offset.x -= event.movementX;
        this.state.source.triggerPosition += event.movementX / this.state.source.frameSize;
        console.log(this.state.source.triggerPosition);
        return;
    }
};

Oscilloscope.prototype.onScroll = function(event){
    var activeTrace = this.state.source.traces[this.state.source.activeTrace];
    activeTrace.scaling.y += event.wheelDeltaY * 0.01;
    if(activeTrace.scaling.y < 0){
        activeTrace.scaling.y = 0;
    }
    activeTrace.scaling.x += event.wheelDeltaX * 0.01;
    if(activeTrace.scaling.x < 1){
        activeTrace.scaling.x = 1;
    }
};

Oscilloscope.prototype.addMarker = function(id, type, xy){
    var px = 0;
    var py = 0;
    if(type == 'horizontal'){
        py = xy;
    } else {
        px = xy;
    }
    this.state.markers.push({
        id: id, type: type, x: px, y: py
    });
};

Oscilloscope.prototype.uiHandlers = {
    togglePrefPane: function(scope){
        scope.state.ui.prefPane.open = !scope.state.ui.prefPane.open;
    }
};