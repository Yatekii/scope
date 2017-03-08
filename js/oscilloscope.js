function Oscilloscope(container, width, height) {
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
    var me = this;
    this.canvas.onmousedown = function(event){onMouseDown(event, me);};
    this.canvas.onmouseup = function(event){onMouseUp(event, me);};
    this.canvas.onmousemove = function(event){onMouseMove(event, me);};

    this.triggerLevel = 50;
    this.traces = [];

    this.markers = [];
    this.markers.push(
        new Marker(this, 'horizontal', 80),
        new Marker(this, 'vertical', 200)
    );

    this.markerMoving = false;

    this.autoTriggering = true;
    this.triggerMoving = false;
    this.triggerTrace = 0;
    this.triggerType = 'rising'
    triggerLevel = document.getElementById('trigger-level');
}

Oscilloscope.prototype.draw = function () {
    // Make life easier with shorter variables
	var width = this.canvas.clientWidth;
	var height = this.canvas.clientHeight;
    this.canvas.height = height;
    this.canvas.width = width;
    this.scaling = height / 256;
	var scaling = this.scaling;
	var context = this.canvas.getContext('2d');
    context.strokeWidth = 1;

    // Draw background
	context.fillStyle="#222222";
	context.fillRect(0, 0, width, height);

    // Draw trigger level
	context.strokeStyle = "#278BFF";
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
        if(trace.on){
            trace.draw(triggerLocation);
        }
    });

    this.markers.forEach(function(marker) {
        marker.draw();
    });
}

Oscilloscope.prototype.addTrace = function(trace) {
    this.traces.push(trace);
}

Oscilloscope.prototype.addMarker = function(marker) {
    this.markers.push(marker);
}

var MINVAL = 234;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

function getTriggerLocation(buf, buflen, triggerLevel, type){
    switch(type){
        case 'rising':
        default:
            return risingEdgeTrigger(buf, buflen, triggerLevel);
        case 'falling':
            return fallingEdgeTrigger(buf, buflen, triggerLevel);
    }
}

function triggerLevelChange(scope) {
  scope.triggerLevel = parseInt(document.getElementById('trigger-level').value);
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
                console.log(i);
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
        document.getElementById('trigger-level').value = scope.triggerLevel;
        return;
    }

    // Move markers
    if(scope.markerMoving !== false){
        if(scope.markers[scope.markerMoving].x != null){
            var markerLevel = event.offsetX;
            if(markerLevel > scope.canvas.width){
                markerLevel = scope.canvas.width;
            }
            if(markerLevel < 0){
                markerLevel = 0;
            }
            scope.markers[scope.markerMoving].x = markerLevel;
            return;
        } else {
            var markerLevel = 128 - event.offsetY;
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

