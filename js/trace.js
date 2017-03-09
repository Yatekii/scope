// Creates a new trace
function NormalTrace(scope, source) {
    var me = this;

    // Assign class variables
    this.scope = scope;
    this.source = source;
    this.color = '#E8830C';
    this.on = source !== null;
    this.colorpicker = null;
    this.title = null;
    this.icon = null;

    // Create HTML representation
    var tr = this.createTraceRepr('trace-title-' + scope.traces.length, 'trace-switch-' + scope.traces.length)
    this.repr = initRepr(tr, document.getElementById('trace-list'));
    this.repr.id = 'trace-' + scope.traces.length;

    // Find on-off switch
    var on_off = this.repr.getElementsByClassName('trace-on-off')[0];
    on_off.onchange = function(event) { me.onSwitch(me, event); };
    on_off.checked = true;
    componentHandler.upgradeElement(on_off.parentElement);

    // Find color storage and store it
    var input = this.repr.getElementsByClassName('jscolor')[0];
    this.colorpicker = new jscolor(input,{
        'value': this.color,
        'hash': true
    });
    input.value = this.color;
    input.onchange = function(event) { me.setColor(event.target.value);  };

    // Find repr title and store it
    this.title = this.repr.getElementsByClassName('card-title')[0];
    this.title.style.color = this.color;
    componentHandler.upgradeElement(this.title.parentElement);

    // Find repr icon and store it
    this.icon = this.repr.getElementsByClassName('material-icons')[0];
    this.icon.style.color = this.color;
    this.icon.onclick = this.colorpicker.show;

    // Create the data buffer
    if(source && source.ready) {
        this.data = new Uint8Array(this.source.analyzer.frequencyBinCount);
    }
    this.fetched = false;
}

NormalTrace.prototype.setSource = function(source){
    this.source = source;
    this.data = new Uint8Array(this.source.analyzer.frequencyBinCount);
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
    if(!this.fetched && this.source.ready){
        this.source.analyzer.getByteTimeDomainData(this.data);
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
function FFTrace(scope, source) {
    this.scope = scope;
    this.source = source;
    this.color = '#E8830C';
    this.on = source !== null;

    // Create HTML representation
    var tr = this.createTraceRepr('trace-title-' + scope.traces.length, 'trace-switch-' + scope.traces.length)
    this.repr = initRepr(tr, document.getElementById('trace-list'));
    this.repr.id = 'trace-' + scope.traces.length;

    // Find on-off switch
    var on_off = this.repr.getElementsByClassName('trace-on-off')[0];
    on_off.onchange = function(event) { me.onSwitch(me, event); };
    on_off.checked = true;
    componentHandler.upgradeElement(on_off.parentElement);

    // Find color storage and store it
    var input = this.repr.getElementsByClassName('jscolor')[0];
    this.colorpicker = new jscolor(input,{
        'value': this.color,
        'hash': true
    });
    input.value = this.color;
    input.onchange = function(event) { me.setColor(event.target.value);  };

    // Find repr title and store it
    this.title = this.repr.getElementsByClassName('card-title')[0];
    this.title.style.color = this.color;
    componentHandler.upgradeElement(this.title.parentElement);

    // Find repr icon and store it
    this.icon = this.repr.getElementsByClassName('material-icons')[0];
    this.icon.style.color = this.color;
    this.icon.onclick = this.colorpicker.show;
    
    // Create the data buffer
    if(source && source.ready) {
        this.data = new Uint8Array(this.source.analyzer.frequencyBinCount);
    }
    this.fetched = false;
}

FFTrace.prototype.setSource = function(source){
    this.source = source;
    this.data = new Uint8Array(this.source.analyzer.frequencyBinCount);
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
    if(!this.fetched && this.source.ready){
        this.source.analyzer.getByteFrequencyData(this.data);
    }
    this.fetched = true;
}

// Draws trace on the new frame
FFTrace.prototype.draw = function (triggerLocation) {
    var SPACING = 1;
    var BAR_WIDTH = 1;
    var numBars = Math.round(this.scope.canvas.width / SPACING);
    var multiplier = this.source.analyzer.frequencyBinCount / numBars;

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
