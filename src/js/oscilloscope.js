/*
 * This file holds the main control logic for drawing and interfacing a scope.
 * It calls onto various sub objects like traces and markers.
 */

export const Oscilloscope = function(state) {
    // Remember scope state
    this.state = state;

    // remember our canvas
    this.canvas = document.getElementById('scope');

    // Initialize moving elements to not move
    this.markerMoving = false;
    this.triggerMoving = false;
    this.traceMovingY = false;
    this.traceMovingX = false;
};

Oscilloscope.prototype.draw = function() {
    var me = this;

    // If no canvas was yet created or found, we have no business here, return.
    if(this.canvas == null){
        return;
    }

    // Remember important sizes
    var width = document.body.clientWidth - (me.state.ui.prefPane.open ? me.state.ui.prefPane.width : 0);
    var height = document.body.clientHeight;
    var halfHeight = this.state.height / 2;
    var context = this.canvas.getContext('2d');
    var activeTrace = this.state.source.traces[this.state.source.activeTrace];
    const triggerTrace = this.state.source.traces[this.state.source.triggerTrace];

    // Assign new scope properties
    this.canvas.height = this.state.height = height;
    this.canvas.width = this.state.width = width;
    context.strokeWidth = 1;

    // Draw background
    context.fillStyle='#222222';
    context.fillRect(0, 0, width, height);

    // Draw trigger level
    if(triggerTrace.active){
        const triggerHeight = halfHeight + (- this.state.source.trigger.level - triggerTrace.offset.y)
                            * halfHeight * activeTrace.scaling.y;
        context.strokeStyle = '#278BFF';
        context.beginPath();
        context.moveTo(0, triggerHeight);
        context.lineTo(width, triggerHeight);
        context.stroke();
    }

    // Draw all traces if the source is ready
    if(this.state.source._ctrl.ready){
        this.state.source.traces.forEach(function(trace) {
            if(trace.active){
                trace._ctrl.draw(me.canvas);
            }
        });
    }
};

Oscilloscope.prototype.onMouseDown = function(event){
    var me = this;
    const activeTrace = this.state.source.traces[this.state.source.activeTrace];
    const triggerTrace = this.state.source.traces[this.state.source.triggerTrace];
    var halfHeight = this.canvas.height / 2;

    // Start moving triggerlevel
    if(triggerTrace.active){
        var triggerLevel = (this.state.source.trigger.level + triggerTrace.offset.y) * halfHeight * triggerTrace.scaling.y;
        if(halfHeight - event.offsetY < triggerLevel + 3 && halfHeight - event.offsetY > triggerLevel - 3){
            this.triggerMoving = activeTrace;
            return;
        }
    }

    // Start moving markers
    this.state.source.traces.forEach(function(trace){
        trace == activeTrace && trace.markers && trace.markers.forEach(function(marker){
            if(marker.type == 'vertical'){
                var x = (marker.x - activeTrace.offset.x) * me.canvas.width * activeTrace.scaling.x;
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

    if(me.markerMoving) return;

    // If we are in marker adding mode, add new marker
    if(this.addingMarker){
        this.markerMoving = this.addMarker(this.state.source.activeTrace, '', 'vertical', event.offsetX / (me.canvas.width * activeTrace.scaling.x));
        return;
    }

    // Start moving traces in Y direction
    var halfMoverWidth = me.state.ui.mover.width / 2;
    var halfMoverHeight = me.state.ui.mover.height / 2;
    this.state.source.traces.forEach(function(trace) {
        var x = me.canvas.width - me.state.ui.mover.horizontalPosition - halfMoverWidth;
        if(event.offsetX < x + halfMoverWidth && event.offsetX > x - halfMoverWidth){
            var y = trace.offset.y * halfHeight * activeTrace.scaling.y;
            if(halfHeight - event.offsetY < y + halfMoverHeight
            && halfHeight - event.offsetY > y - halfMoverHeight){
                me.traceMovingY = trace;
                return;
            }
        }
    });

    if(me.traceMovingY) return;
    // If we didnd't start moving a trace already, we start moving in X direction
    me.traceMovingX = activeTrace;
};

Oscilloscope.prototype.onMouseUp = function(){
    // End moving triggerlevel
    if(this.triggerMoving){
        this.triggerMoving = false;
        return;
    }

    // End moving markers
    if(this.markerMoving !== false){
        this.markerMoving = false;
        return;
    }

    // End moving traces Y
    if(this.traceMovingY !== false){
        this.traceMovingY = false;
        return;
    }

    // End moving traces X
    if(this.traceMovingX !== false){
        this.traceMovingX = false;
        return;
    }
};

Oscilloscope.prototype.onMouseMove = function(event){
    var me = this;
    const activeTrace = this.state.source.traces[this.state.source.activeTrace];
    const triggerTrace = this.state.source.traces[this.state.source.triggerTrace];
    var halfHeight = this.canvas.height / 2;
    var halfMoverWidth = this.state.ui.mover.width / 2;
    var halfMoverHeight = this.state.ui.mover.height / 2;
    // Trigger level on the screen
    var triggerLevel = (this.state.source.trigger.level + triggerTrace.offset.y) * halfHeight * activeTrace.scaling.y;
    var cursorSet = false;

    // Change cursor if trigger set is active
    if(triggerTrace.active){
        if(halfHeight - event.offsetY < triggerLevel + 3 && halfHeight - event.offsetY > triggerLevel - 3){
            document.body.style.cursor = 'row-resize';
            cursorSet = true;
        }
    }
    
    // Change cursor if marker set is active
    if(!cursorSet){
        this.state.source.traces.forEach(function(trace){
            trace == activeTrace && trace.markers && trace.markers.forEach(function(marker){
                if(marker.type == 'vertical'){
                    // (event.offsetX / this.canvas.width + activeTrace.offset.x) * activeTrace.scaling.x
                    var x = (marker.x - activeTrace.offset.x) * me.canvas.width * activeTrace.scaling.x;
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
        this.state.source.traces.forEach(function(trace) {
            var x = me.canvas.width - me.state.ui.mover.horizontalPosition - halfMoverWidth;
            if(event.offsetX < x + halfMoverWidth && event.offsetX > x - halfMoverWidth){
                var y = trace.offset.y * halfHeight * activeTrace.scaling.y;
                if(halfHeight - event.offsetY < y + halfMoverHeight
                && halfHeight - event.offsetY > y - halfMoverHeight){
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
    if(this.triggerMoving !== false){
        triggerLevel = (halfHeight - event.offsetY) / (halfHeight * activeTrace.scaling.y) - triggerTrace.offset.y;
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
            markerLevel = (event.offsetX / this.canvas.width + activeTrace.offset.x) / activeTrace.scaling.x;
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

    // Move traces Y if move traces Y is active
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

    // Move traces X if move traces X is active
    if(this.traceMovingX !== false){
        const ratio = 1 / this.canvas.width;
        var offsetX = ratio * event.movementX / this.traceMovingX.scaling.x;
        this.traceMovingX.offset.x -= offsetX;
        if(this.traceMovingX.offset.x < 0){
            this.traceMovingX.offset.x = 0;
        }
        if(this.traceMovingX.offset.x > 1){
            this.traceMovingX.offset.x = 1;
        }
        if(this.traceMovingX == triggerTrace){
            this.state.source.triggerPosition += offsetX;
        }
        if(this.state.source.triggerPosition < 0){
            this.state.source.triggerPosition = 0;
        }
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

/*
 * UI handler controls for buttons etc
 */
Oscilloscope.prototype.uiHandlers = {
    togglePrefPane: function(scope){
        scope.state.ui.prefPane.open = !scope.state.ui.prefPane.open;
    }
};

Oscilloscope.prototype.addMarker = function(trace, id, type, xy){
    return this.state.source.traces[trace]._ctrl.addMarker(id, type, xy, true);
};