import * as helpers from './helpers.js';
import * as marker from './marker.js';
import * as button from './button.js';
import * as converting from './math/converting.js';

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

    var width = document.body.clientWidth - (me.state.ui.prefPane.open ? me.state.ui.prefPane.width : 0);
    var height = document.body.clientHeight;
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
    // console.log(this.state.source.trigger.level * 8192 + 8192);
    context.strokeStyle = '#278BFF';
    context.beginPath();
    context.moveTo(0, halfHeight - this.state.source.trigger.level * halfHeight * this.state.scaling.y);
    context.lineTo(width, halfHeight - this.state.source.trigger.level * halfHeight * this.state.scaling.y);
    context.stroke();

    this.state.source.traces.forEach(function(trace) {
        console.log(me.state.source.ctrl.ready)
        if(me.state.source.ctrl.ready){
            trace.ctrl.draw(me.canvas);
        }
    });

    me.state.markers.forEach(function(m) {
        marker.draw(context, me.state, m);
    });

    /* Draw scales */
    context.strokeWidth = 1;
    context.strokeStyle = '#ABABAB';
    context.setLineDash([5]);

    context.font = "30px Arial";
    context.fillStyle = 'blue';

    var unit = 1e9
    var skip = 1;
    var mul = 1;
    var ratio = width / me.state.source.frameSize * me.state.scaling.x; // pixel/sample
    var nStart = 1e18;
    var n = 1e18;
    var dt = ratio / me.state.source.samplingRate * n;
    for(var a = 0; a < 20; a++){
        if(width / dt > 1 && width / dt < 11){
            break;
        }
        n *= 1e-1;
        dt = ratio / me.state.source.samplingRate * n;
    }
     // pixel / sample * sample / sek
    var i;
    for(i = 0; i < 11; i++){
        context.beginPath();
        context.moveTo(dt * i, 0);
        context.lineTo(dt * i, height);
        context.stroke();
    }
        // context.beginPath();
        // var halfHeight = scope.height / 2;
        // context.moveTo(0, halfHeight - state.y * halfHeight);
        // context.lineTo(scope.width, halfHeight - state.y * halfHeight);
        // context.stroke();

    // Draw legend
    context.strokeStyle = '#ABABAB';
    context.fillStyle='#222222';
    context.setLineDash([0]);
    context.rect(width - 300, 20, 280, 180);
    context.stroke();
    context.fill();
    context.textAlign = 'left';
    context.font = '20px Arial';
    context.fillStyle = '#ABABAB';
    context.textBaseline = 'hanging';
    context.fillText('Δt = ' + converting.secondsToString(me.state.source.samplingRate / (nStart / n)), width - 290, 30);
};

Oscilloscope.prototype.onMouseDown = function(event){
    // Start moving triggerlevel
    // TODO: adjust trigger level setup to be dependant on active trace
    var halfHeight = this.canvas.height / 2;
    var triggerLevel = this.state.source.trigger.level * halfHeight * this.state.scaling.y;
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
                    me.uiHandlers[button.handler](me);
                }
            }
        });
    }
};

Oscilloscope.prototype.onMouseMove = function(event){
    var halfHeight = this.canvas.height / 2;
    var halfMoverWidth = this.state.ui.mover.width / 2;
    var halfMoverHeight = this.state.ui.mover.height / 2;
    var triggerLevel = this.state.source.trigger.level * halfHeight * this.state.scaling.y;
    var cursorSet = false;

    // Change cursor if trigger set is active
    if(halfHeight - event.offsetY < triggerLevel + 3 && halfHeight - event.offsetY > triggerLevel - 3){
        document.body.style.cursor = 'row-resize';
        cursorSet = true;
    }
    // Change cursor if marker set is active
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
    // Change cursor if trace set is active
    if(!cursorSet){
        var me = this;
        this.state.source.traces.forEach(function(trace) {
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
    // Change cursor if nothing set is active
    if(!cursorSet){
        document.body.style.cursor = 'initial';
    }


    // Move triggerlevel is active
    if(this.triggerMoving){
        triggerLevel = (halfHeight - event.offsetY) / (halfHeight * this.state.scaling.y);
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

    // Move traces if move traces is active
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

Oscilloscope.prototype.getMarkerById = function(id){
    var result = this.state.markers.filter(function( obj ) {
        return obj.id == id;
    });
    return result;
};

Oscilloscope.prototype.setSNRMarkers = function(firstX, secondX){
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

Oscilloscope.prototype.setFirstSNRMarker = function(firstX){
    var first = this.getMarkerById('SNRfirst');
    if(first.length < 1){
        this.addMarker('SNRfirst', 'vertical', firstX);
        return;
    }
    first[0].x = firstX;
};

Oscilloscope.prototype.setSecondSNRMarker = function(secondX){
    var second = this.getMarkerById('SNRsecond');
    if(second.length < 1){
        this.addMarker('SNRsecond', 'vertical', secondX);
        return;
    }
    second[0].x = secondX;
};

Oscilloscope.prototype.uiHandlers = {
    togglePrefPane: function(scope){
        scope.state.ui.prefPane.open = !scope.state.ui.prefPane.open;
    }
};