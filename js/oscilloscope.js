function Oscilloscope(container, width, height, sources) {
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
    this.triggerLevel = 40;
    this.trace1 = new Trace(this, sources[0]);
    this.trace2 = new Trace(this, sources[1]);
    this.trace2.color = '#E85D55';
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
    context.save();

    // Draw markers
    var quarterHeight = height / 4;
	context.strokeStyle = "#006644";
	context.beginPath();
	if (context.setLineDash)
		context.setLineDash([5]);
	context.moveTo(0, quarterHeight);
	context.lineTo(width, quarterHeight);
	context.stroke();
	context.moveTo(0, quarterHeight * 3);
	context.lineTo(width, quarterHeight * 3);
	context.stroke();

    // Undo dashed stroke
    context.restore();

    // Draw trigger level
	context.strokeStyle = "#278BFF";
	context.beginPath();
	context.moveTo(0, 128 - this.triggerLevel);
	context.lineTo(width, 128 - this.triggerLevel);
	context.stroke();

    this.trace1.fetch();
	var triggerLocation = getTriggerLocation(this.trace1.data, width, this.triggerLevel, 'rising');

	this.trace1.draw(triggerLocation);
    this.trace2.draw(triggerLocation);
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