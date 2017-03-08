var traceRepresentation = '<div class="card blue-grey darken-1 col b3 source">\
    <div class="card-content white-text">\
        <span class="card-title">Trace</span><input class="jscolor" value="ab2567">\
    </div>\
    <div class="card-action">\
        <div class="switch">\
            <label>\
                Off\
                <input type="checkbox" class="trace-on-off">\
                <span class="lever"></span>\
                On\
            </label>\
        </div>\
    </div>\
</div>';

var FFTRepresentation = '<div class="card blue-grey darken-1 col b3 source">\
    <div class="card-content white-text">\
        <span class="card-title">FFT</span><input class="jscolor" value="ab2567">\
		Pick text color\
	</button>\
    </div>\
    <div class="card-action">\
        <div class="switch">\
            <label>\
                Off\
                <input type="checkbox" class="trace-on-off">\
                <span class="lever"></span>\
                On\
            </label>\
        </div>\
    </div>\
</div>';

function NormalTrace(scope, source, repr, defaultOn) {
    this.scope = scope;
    this.source = source;
    this.color = '#E8830C';
    this.fetched = false;
    this.repr = repr;
    this.on = defaultOn;
    this.colorpicker = null;

    var potentialButtons = document.getElementsByClassName('trace-on-off');
    for(i = 0; i < potentialButtons.length; i++){
        var x = potentialButtons[i];
        while (x = x.parentElement) { 
            if (x == repr){
                var me = this;
                potentialButtons[i].onchange = function(event) { me.onSwitch(me, event); };
                potentialButtons[i].checked = true;
                break;
            }
        }
    }

    var potentialInputs = document.getElementsByClassName('jscolor');
    for(i = 0; i < potentialInputs.length; i++){
        var x = potentialInputs[i];
        while (x = x.parentElement) { 
            if (x == repr){
                var me = this;
                this.colorpicker = new jscolor(potentialInputs[i],{'value': this.color, 'hash': true});
                potentialInputs[i].value = this.color;
                potentialInputs[i].onchange = function(event) { me.setColor(event.target.value);  };
                break;
            }
        }
    }

    if(source.output){
        // Create the analyzer node to be able to read sample output
        this.analyzer = getAudioContext().createAnalyser();
        this.analyzer.fftSize = 4096;
        // Connect the source output to the analyzer
        source.output.connect(this.analyzer);

        // Create the data buffer
        this.data = new Uint8Array(this.analyzer.frequencyBinCount);
    }
}

NormalTrace.prototype.setColor = function(color) {
    this.colorpicker.fromString(color)
    this.color = color;
}

NormalTrace.prototype.onSwitch = function(trace, event) {
    trace.on = event.target.checked;
}

NormalTrace.prototype.fetch = function () {
    if(!this.fetched){
        this.analyzer.getByteTimeDomainData(this.data);
    }
    this.fetched = true;
}

NormalTrace.prototype.draw = function (triggerLocation) {
    // Make life easier with shorter variables
	var context = this.scope.canvas.getContext('2d');
    context.strokeWidth = 1;
    this.fetch();

    // Draw trace
	context.strokeStyle = this.color;
	context.beginPath();

	context.moveTo(0, (256 - this.data[triggerLocation]) * this.scope.scaling);
	for (var i=triggerLocation, j=0; (j < this.scope.canvas.width) && (i < this.data.length); i++, j++){
		context.lineTo(j, (256 - this.data[i]) * this.scope.scaling);
    }
	context.stroke();
    this.fetched = false;
}

function FFTrace(scope, analyzer) {
    this.scope = scope;
    this.analyzer = analyzer;
    this.color = '#E8830C';
    
    // Create the data buffer
    this.data = new Uint8Array(this.analyzer.frequencyBinCount);
    this.on = true;
}

FFTrace.prototype.fetch = function () {
    if(!this.fetched){
        this.analyzer.getByteFrequencyData(this.data);
    }
    this.fetched = true;
}

FFTrace.prototype.draw = function (triggerLocation) {
    var SPACING = 1;
    var BAR_WIDTH = 1;
    var numBars = Math.round(this.scope.canvas.width / SPACING);
    var multiplier = this.analyzer.frequencyBinCount / numBars;

    var context = this.scope.canvas.getContext('2d');
    context.lineCap = 'round';

    this.fetch();

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++) {
            magnitude += this.data[offset + j];
        }
        magnitude = magnitude / multiplier;
        context.fillStyle = "hsl(" + Math.round((i*360)/numBars) + ", 100%, 50%)";
        context.fillRect(i * SPACING, this.scope.canvas.height, BAR_WIDTH, -magnitude);
    }
    this.fetched = false;
}
