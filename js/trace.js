// Creates a new trace
function NormalTrace(scope, source, defaultOn) {
    var me = this;

    // Assign class variables
    this.scope = scope;
    this.source = source;
    this.color = '#E8830C';
    this.fetched = false;
    this.on = defaultOn;
    this.colorpicker = null;
    this.title = null;
    this.icon = null;

    // Create HTML representation
    var tr = this.createTraceRepr('trace-title-' + scope.traces.length, 'trace-switch-' + scope.traces.length)
    var repr = initRepr(tr, document.getElementById('trace-list'));
    this.repr = repr;

    // Find on-off switch
    var on_off = repr.getElementsByClassName('trace-on-off')[0];
    on_off.onchange = function(event) { me.onSwitch(me, event); };
    on_off.checked = true;
    componentHandler.upgradeElement(on_off.parentElement);

    // Find color storage and store it
    var input = repr.getElementsByClassName('jscolor')[0];
    this.colorpicker = new jscolor(input,{
        'value': this.color,
        'hash': true
    });
    input.value = this.color;
    input.onchange = function(event) { me.setColor(event.target.value);  };

    // Find repr title and store it
    this.title = document.getElementsByClassName('card-title')[0];
    this.title.style.color = this.color;
    componentHandler.upgradeElement(this.title.parentElement);

    // Find repr icon and store it
    this.icon = document.getElementsByClassName('material-icons')[0];
    this.icon.style.color = this.color;
    this.icon.onclick = this.colorpicker.show;

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

// Instantiates the GUI representation
NormalTrace.prototype.createTraceRepr = function(title_id, switch_id) {
    return `<li class="mdl-list__item">
        <div class="mdl-card mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">timeline</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">Trace</label>
                </div><input class="jscolor">
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>
    </li>`;
}

// Sets a new color for the trace, both in the UI and on the scope canvas
NormalTrace.prototype.setColor = function(color) {
    this.colorpicker.fromString(color)
    this.color = color;
    this.icon.style.color = this.color;
    this.title.style.color = this.color;
}

// Activates drawing of a trace on the scope
NormalTrace.prototype.onSwitch = function(trace, event) {
    trace.on = event.target.checked;
}

// Preemptively fetches a new sample set
NormalTrace.prototype.fetch = function () {
    if(!this.fetched){
        this.analyzer.getByteTimeDomainData(this.data);
    }
    this.fetched = true;
}

// Draws trace on the new frame
NormalTrace.prototype.draw = function (triggerLocation) {
    // Make life easier with shorter variables
	var context = this.scope.canvas.getContext('2d');
    context.strokeWidth = 1;

    // Get a new dataset
    this.fetch();

    // Draw trace
	context.strokeStyle = this.color;
	context.beginPath();
    // Draw samples
	context.moveTo(0, (256 - this.data[triggerLocation]) * this.scope.scaling);
	for (var i=triggerLocation, j=0; (j < this.scope.canvas.width) && (i < this.data.length); i++, j++){
		context.lineTo(j, (256 - this.data[i]) * this.scope.scaling);
    }
    // Fix drawing on canvas
	context.stroke();

    // Mark data as deprecated
    this.fetched = false;
}

// Creates a new source
function FFTrace(scope, analyzer) {
    this.scope = scope;
    this.analyzer = analyzer;
    this.color = '#E8830C';

    // Create HTML representation
    var tr = this.createTraceRepr('trace-title-' + scope.traces.length, 'trace-switch-' + scope.traces.length)
    var repr = initRepr(tr, document.getElementById('trace-list'));
    componentHandler.upgradeElement(repr);
    this.repr = repr;

    // Find on-off switch
    var on_off = repr.getElementsByClassName('trace-on-off')[0];
    on_off.onchange = function(event) { me.onSwitch(me, event); };
    on_off.checked = true;
    componentHandler.upgradeElement(on_off.parentElement);

    // Find color storage and store it
    var input = repr.getElementsByClassName('jscolor')[0];
    this.colorpicker = new jscolor(input,{
        'value': this.color,
        'hash': true
    });
    input.value = this.color;
    input.onchange = function(event) { me.setColor(event.target.value);  };

    // Find repr title and store it
    this.title = document.getElementsByClassName('card-title')[0];
    this.title.style.color = this.color;
    componentHandler.upgradeElement(this.title.parentElement);

    // Find repr icon and store it
    this.icon = document.getElementsByClassName('material-icons')[0];
    this.icon.style.color = this.color;
    this.icon.onclick = this.colorpicker.show;
    
    // Create the data buffer
    this.data = new Uint8Array(this.analyzer.frequencyBinCount);
    this.on = true;
}

// Instantiates the GUI representation
FFTrace.prototype.createTraceRepr = function(title_id, switch_id) {
    return `<li class="mdl-list__item">
        <div class="mdl-card mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">equalizer</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">FFT</label>
                </div><input class="jscolor">
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>
    </li>`;
}

// Sets a new color for the trace, both in the UI and on the scope canvas
FFTrace.prototype.setColor = function(color) {
    this.colorpicker.fromString(color)
    this.color = color;
}

// Activates drawing of a trace on the scope
FFTrace.prototype.onSwitch = function(trace, event) {
    trace.on = event.target.checked;
}

// Preemptively fetches a new sample set
FFTrace.prototype.fetch = function () {
    if(!this.fetched){
        this.analyzer.getByteFrequencyData(this.data);
    }
    this.fetched = true;
}

// Draws trace on the new frame
FFTrace.prototype.draw = function (triggerLocation) {
    var SPACING = 1;
    var BAR_WIDTH = 1;
    var numBars = Math.round(this.scope.canvas.width / SPACING);
    var multiplier = this.analyzer.frequencyBinCount / numBars;

    var context = this.scope.canvas.getContext('2d');
    context.lineCap = 'round';

    // Get a new dataset
    this.fetch();

    // Draw rectangle for each frequency
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

    // Mark data as deprecated
    this.fetched = false;
}
